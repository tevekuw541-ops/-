import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { createApplicant, listApplicants } from "@/lib/db";
import { runScheduleOcr } from "@/lib/ocr";
import { allowedImageTypes, maxImageSize, validateApplicantFields } from "@/lib/validators";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  return NextResponse.json({ applicants: listApplicants(params) });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const fields = {
    name: String(form.get("name") ?? "").trim(),
    phone: String(form.get("phone") ?? "").trim(),
    wechat: String(form.get("wechat") ?? "").trim(),
    grade: String(form.get("grade") ?? "").trim(),
    gender: String(form.get("gender") ?? "").trim(),
    remark: String(form.get("remark") ?? "").trim()
  };
  const errors = validateApplicantFields(fields);
  const file = form.get("schedule") as File | null;

  if (!file || file.size === 0) errors.schedule = "请上传课表图片";
  if (file && !allowedImageTypes.includes(file.type)) errors.schedule = "只支持 jpg、jpeg、png、webp 图片";
  if (file && file.size > maxImageSize) errors.schedule = "图片不能超过 10MB";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });

  const extension = file!.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), Buffer.from(await file!.arrayBuffer()));

  const ocr = await runScheduleOcr(fileName);
  const id = createApplicant({
    ...fields,
    scheduleImageUrl: `/uploads/${fileName}`,
    scheduleOcrText: ocr.text,
    scheduleOcrJson: ocr.json,
    inferredFreeSlots: ocr.freeSlots
  });

  return NextResponse.json({ id, ok: true });
}
