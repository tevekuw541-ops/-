"use client";

import { Search, Download } from "lucide-react";
import { days, periods } from "@/lib/slots";
import { statusLabels } from "@/lib/validators";

export function ApplicantFilters({ grades }: { grades: string[] }) {
  return (
    <form className="grid gap-3 rounded-2xl bg-white p-4 shadow-soft lg:grid-cols-6" action="/admin/applicants">
      <input name="q" placeholder="姓名/手机号/微信" className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-400 lg:col-span-2" />
      <select name="grade" className="rounded-xl border border-slate-200 px-3 py-2">
        <option value="">全部年级</option>
        {grades.map((grade) => <option key={grade}>{grade}</option>)}
      </select>
      <select name="gender" className="rounded-xl border border-slate-200 px-3 py-2">
        <option value="">全部性别</option>
        <option>男</option>
        <option>女</option>
        <option>不方便透露</option>
      </select>
      <select name="status" className="rounded-xl border border-slate-200 px-3 py-2">
        <option value="">全部状态</option>
        {Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <select name="day" className="rounded-xl border border-slate-200 px-3 py-2">
          <option value="">空闲日期</option>
          {days.map((day) => <option key={day.key} value={day.key}>{day.label}</option>)}
        </select>
        <select name="period" className="rounded-xl border border-slate-200 px-3 py-2">
          <option value="">节次</option>
          {periods.map((period) => <option key={period.key} value={period.key}>{period.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:col-span-2">
        <input type="date" name="from" className="rounded-xl border border-slate-200 px-3 py-2" />
        <input type="date" name="to" className="rounded-xl border border-slate-200 px-3 py-2" />
      </div>
      <button className="tap-pop inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2 font-bold text-chalk">
        <Search className="h-4 w-4" /> 筛选
      </button>
      <button
        type="submit"
        formAction="/api/export"
        className="tap-pop inline-flex items-center justify-center gap-2 rounded-xl bg-coral px-4 py-2 font-bold text-white"
      >
        <Download className="h-4 w-4" /> 导出 CSV
      </button>
    </form>
  );
}
