import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock3, Users } from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { ApplicantFilters } from "@/components/ApplicantFilters";
import { ApplicantActions } from "@/components/ApplicantActions";
import { ApplicantListCharts } from "@/components/Charts";
import { getGradeOptions } from "@/lib/grades";
import { isAdminSession } from "@/lib/auth";
import { listApplicants } from "@/lib/db";
import { days } from "@/lib/slots";
import { statusLabels } from "@/lib/validators";
import type { ApplicantFilters as Filters, ApplicantStatus, ApplicantView } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ApplicantsPage({ searchParams }: { searchParams: Promise<Filters> }) {
  if (!(await isAdminSession())) redirect("/admin/login");
  const filters = await searchParams;
  const applicants = listApplicants(filters);
  const stats = buildListStats(applicants);

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-coral">报名列表</p>
            <h1 className="text-3xl font-black text-ink">筛选、查看和导出</h1>
          </div>
          <p className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-sm">
            图表会跟随当前筛选结果实时变化
          </p>
        </div>

        <ApplicantFilters grades={getGradeOptions()} />

        <section className="mt-5 grid gap-3 md:grid-cols-3">
          <Metric icon={Users} label="当前结果" value={applicants.length} />
          <Metric icon={Clock3} label="未联系" value={stats.pending} />
          <Metric icon={CheckCircle2} label="合适" value={stats.qualified} />
        </section>

        <ApplicantListCharts
          byGrade={stats.byGrade}
          byGender={stats.byGender}
          byStatus={stats.byStatus}
          bySlot={stats.bySlot}
        />

        <section className="mt-5 overflow-hidden rounded-2xl bg-white shadow-soft">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="font-black text-ink">报名数据</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-emerald-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">姓名</th>
                  <th>手机号</th>
                  <th>微信号</th>
                  <th>年级</th>
                  <th>性别</th>
                  <th>课表</th>
                  <th>报名时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-4 font-bold">{item.name}</td>
                    <td>{item.phone}</td>
                    <td>{item.wechat}</td>
                    <td>{item.grade}</td>
                    <td>{item.gender}</td>
                    <td>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        已上传
                      </span>
                    </td>
                    <td>{item.created_at}</td>
                    <td>{statusLabels[item.status]}</td>
                    <td className="space-y-2 py-3">
                      <Link className="inline-block rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white" href={`/admin/applicants/${item.id}`}>
                        查看详情
                      </Link>
                      <ApplicantActions id={item.id} status={item.status} />
                    </td>
                  </tr>
                ))}
                {!applicants.length && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      暂无符合条件的报名
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <Icon className="mb-3 h-6 w-6 text-coral" />
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-ink">{value}</p>
    </div>
  );
}

function buildListStats(applicants: ApplicantView[]) {
  const byGrade = new Map<string, number>();
  const byGender = new Map<string, number>();
  const byStatus = new Map<ApplicantStatus, number>();
  const bySlot = new Map<string, number>();

  for (const applicant of applicants) {
    byGrade.set(applicant.grade, (byGrade.get(applicant.grade) ?? 0) + 1);
    byGender.set(applicant.gender, (byGender.get(applicant.gender) ?? 0) + 1);
    byStatus.set(applicant.status, (byStatus.get(applicant.status) ?? 0) + 1);

    for (const day of days) {
      for (const slot of applicant.freeSlots[day.key]) {
        const key = `${day.key}|${slot}`;
        bySlot.set(key, (bySlot.get(key) ?? 0) + 1);
      }
    }
  }

  return {
    pending: byStatus.get("pending") ?? 0,
    qualified: byStatus.get("qualified") ?? 0,
    byGrade: [...byGrade].map(([name, count]) => ({ name, count })),
    byGender: [...byGender].map(([name, value]) => ({ name, value })),
    byStatus: (Object.keys(statusLabels) as ApplicantStatus[]).map((status) => ({
      name: statusLabels[status],
      count: byStatus.get(status) ?? 0
    })),
    bySlot: [...bySlot].map(([key, count]) => ({ key, count }))
  };
}
