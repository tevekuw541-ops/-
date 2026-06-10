"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ScanLine } from "lucide-react";
import { ScheduleGrid } from "./ScheduleGrid";
import { busyToFreeSlots, freeToBusySlots } from "@/lib/slots";
import type { ApplicantView } from "@/lib/types";

export function ApplicantDetailEditor({ applicant }: { applicant: ApplicantView }) {
  const router = useRouter();
  const [busySlots, setBusySlots] = useState(() => freeToBusySlots(applicant.freeSlots));
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState("");

  const save = async () => {
    setSaving(true);
    await fetch(`/api/applicants/${applicant.id}`, {
      method: "PATCH",
      body: JSON.stringify({ freeSlots: busyToFreeSlots(busySlots) })
    });
    setSaving(false);
    router.refresh();
  };

  const analyze = async () => {
    setAnalyzing(true);
    setMessage("");
    const response = await fetch(`/api/applicants/${applicant.id}/analyze`, { method: "POST" });
    const data = await response.json();
    setAnalyzing(false);
    if (!response.ok) {
      setMessage(data.error || "自动识别失败，请手动标记有课节次。");
      return;
    }
    setBusySlots(freeToBusySlots(data.analysis.freeSlots));
    setMessage(data.analysis.text);
    router.refresh();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-2xl bg-white p-4 shadow-soft">
        <h2 className="mb-3 font-black text-ink">课表原图</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          <img src={applicant.schedule_image_url} alt={`${applicant.name} 的课表`} className="max-h-[620px] w-full object-contain" />
        </div>
        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          <p className="font-black">识别说明</p>
          <p>{message || applicant.schedule_ocr_text || "暂无识别结果"}</p>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-soft">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-black text-ink">有课节次</h2>
            <p className="text-sm text-slate-500">请按课表核对并标记“有课”。系统会自动反推出没课时间用于后台筛选。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={analyze} disabled={analyzing} className="tap-pop inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white disabled:opacity-60">
              <ScanLine className="h-4 w-4" /> {analyzing ? "识别中..." : "自动识别有课"}
            </button>
            <button onClick={save} disabled={saving} className="tap-pop inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2 font-bold text-chalk disabled:opacity-60">
              <Save className="h-4 w-4" /> {saving ? "保存中..." : "保存有课节次"}
            </button>
          </div>
        </div>
        <ScheduleGrid value={busySlots} onChange={setBusySlots} />
      </section>
    </div>
  );
}
