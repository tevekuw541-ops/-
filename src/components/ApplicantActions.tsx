"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { statusLabels } from "@/lib/validators";
import type { ApplicantStatus } from "@/lib/types";

export function ApplicantActions({ id, status }: { id: number; status: ApplicantStatus }) {
  const router = useRouter();

  const patchStatus = async (nextStatus: ApplicantStatus) => {
    await fetch(`/api/applicants/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus })
    });
    router.refresh();
  };

  const remove = async () => {
    if (!window.confirm("确定删除这条报名记录吗？")) return;
    await fetch(`/api/applicants/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(statusLabels).map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => patchStatus(key as ApplicantStatus)}
          className={`tap-pop rounded-xl px-3 py-2 text-xs font-bold ${
            status === key ? "bg-ink text-chalk" : "bg-slate-100 text-slate-600"
          }`}
        >
          {label}
        </button>
      ))}
      <button type="button" onClick={remove} className="tap-pop inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
        <Trash2 className="h-3.5 w-3.5" /> 删除
      </button>
    </div>
  );
}
