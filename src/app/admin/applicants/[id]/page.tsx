import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminHeader } from "@/components/AdminHeader";
import { ApplicantActions } from "@/components/ApplicantActions";
import { ApplicantDetailEditor } from "@/components/ApplicantDetailEditor";
import { getApplicant } from "@/lib/db";
import { isAdminSession } from "@/lib/auth";
import { statusLabels } from "@/lib/validators";

export const dynamic = "force-dynamic";

export default async function ApplicantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) redirect("/admin/login");
  const { id } = await params;
  const applicant = getApplicant(Number(id));
  if (!applicant) notFound();

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/admin/applicants" className="text-sm font-bold text-emerald-700">返回报名列表</Link>
            <h1 className="mt-2 text-3xl font-black text-ink">{applicant.name} 的报名详情</h1>
            <p className="mt-1 text-sm text-slate-500">状态：{statusLabels[applicant.status]} · 报名时间：{applicant.created_at}</p>
          </div>
          <ApplicantActions id={applicant.id} status={applicant.status} />
        </div>

        <section className="mb-5 grid gap-3 rounded-2xl bg-white p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-5">
          <Info label="手机号" value={applicant.phone} />
          <Info label="微信号" value={applicant.wechat} />
          <Info label="年级" value={applicant.grade} />
          <Info label="性别" value={applicant.gender} />
          <Info label="备注" value={applicant.remark || "无"} />
        </section>

        <ApplicantDetailEditor applicant={applicant} />
      </main>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 break-words font-black text-ink">{value}</p>
    </div>
  );
}
