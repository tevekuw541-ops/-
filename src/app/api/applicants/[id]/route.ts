import { NextRequest, NextResponse } from "next/server";
import { deleteApplicant, getApplicant, updateApplicant } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { ApplicantStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const applicant = getApplicant(Number(id));
  if (!applicant) return NextResponse.json({ error: "未找到报名记录" }, { status: 404 });
  return NextResponse.json({ applicant });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const applicant = updateApplicant(Number(id), {
    freeSlots: body.freeSlots,
    status: body.status as ApplicantStatus,
    remark: body.remark
  });
  if (!applicant) return NextResponse.json({ error: "未找到报名记录" }, { status: 404 });
  return NextResponse.json({ applicant });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  deleteApplicant(Number(id));
  return NextResponse.json({ ok: true });
}
