import { NextRequest, NextResponse } from "next/server";
import { listApplicants } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { days, periods } from "@/lib/slots";
import { statusLabels } from "@/lib/validators";

export const dynamic = "force-dynamic";

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const filters = Object.fromEntries(request.nextUrl.searchParams.entries());
  const applicants = listApplicants(filters);
  const headers = [
    "姓名",
    "手机号",
    "微信号",
    "年级",
    "性别",
    "状态",
    "报名时间",
    "备注",
    "空闲节次"
  ];
  const rows = applicants.map((item) => {
    const slots = days
      .flatMap((day) =>
        periods
          .filter((period) => item.freeSlots[day.key].includes(period.key))
          .map((period) => `${day.label}${period.label}`)
      )
      .join("、");
    return [
      item.name,
      item.phone,
      item.wechat,
      item.grade,
      item.gender,
      statusLabels[item.status],
      item.created_at,
      item.remark,
      slots
    ];
  });
  const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="blackboard-cat-applicants.csv"`
    }
  });
}
