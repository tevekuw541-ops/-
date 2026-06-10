import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getApplicant, updateScheduleAnalysis } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { analyzeScheduleImage } from "@/lib/ocr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const applicant = getApplicant(Number(id));
  if (!applicant) return NextResponse.json({ error: "未找到报名记录" }, { status: 404 });

  const fileName = path.basename(applicant.schedule_image_url);
  const analysis = await analyzeScheduleImage(fileName);
  const updated = updateScheduleAnalysis(Number(id), {
    scheduleOcrText: analysis.text,
    scheduleOcrJson: analysis.json,
    freeSlots: analysis.freeSlots
  });

  return NextResponse.json({ applicant: updated, analysis });
}
