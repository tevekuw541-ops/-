"use client";

import { useMemo, useState } from "react";
import { UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ApplicantForm({ grades }: { grades: string[] }) {
  const router = useRouter();
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const progressText = useMemo(() => {
    if (!loading) return "";
    if (progress < 45) return "黑板猫正在收课表...";
    if (progress < 90) return "正在保存报名信息...";
    return "马上完成！";
  }, [loading, progress]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    setProgress(18);
    const timer = window.setInterval(() => setProgress((value) => Math.min(value + 16, 92)), 300);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/applicants", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        const message = data.errors ? Object.values(data.errors).join("；") : data.error;
        throw new Error(message || "提交失败，请稍后再试");
      }
      setProgress(100);
      router.push("/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败，请稍后再试");
    } finally {
      window.clearInterval(timer);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <section className="rounded-3xl bg-white p-5 shadow-soft">
        <p className="mb-4 text-sm font-bold text-coral">第一步：告诉黑板猫你是谁</p>
        <div className="grid gap-3">
          <input name="name" required placeholder="姓名" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400" />
          <div className="grid grid-cols-2 gap-3">
            <select name="grade" required className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400">
              <option value="">选择年级</option>
              {grades.map((grade) => <option key={grade}>{grade}</option>)}
            </select>
            <select name="gender" required className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400">
              <option value="">性别</option>
              <option>男</option>
              <option>女</option>
              <option>不方便透露</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-soft">
        <p className="mb-4 text-sm font-bold text-coral">第二步：留下联系方式</p>
        <div className="grid gap-3">
          <input name="phone" required inputMode="tel" placeholder="手机号" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400" />
          <input name="wechat" required placeholder="微信号" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400" />
          <textarea name="remark" placeholder="备注：比如可兼职时间、配送经验" rows={3} className="resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400" />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-soft">
        <p className="mb-4 text-sm font-bold text-coral">第三步：上传你的课表</p>
        <label className="tap-pop flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/70 p-6 text-center">
          <UploadCloud className="mb-2 h-9 w-9 text-emerald-600" />
          <span className="font-bold text-emerald-950">{fileName || "点击选择课表图片"}</span>
          <span className="mt-1 text-xs text-slate-500">支持 jpg、png、jpeg、webp，最大 10MB</span>
          <input
            name="schedule"
            required
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setFileName(file.name);
              setPreview(URL.createObjectURL(file));
            }}
          />
        </label>
        {preview && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-100">
            <img src={preview} alt="课表预览" className="max-h-80 w-full object-contain bg-slate-50" />
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4" /> 课表预览已就位
            </div>
          </div>
        )}
      </section>

      {error && <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>}
      {loading && (
        <div className="rounded-2xl bg-white p-4 shadow-soft">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-900">
            <Loader2 className="h-4 w-4 animate-spin" /> {progressText}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      <button disabled={loading} className="tap-pop w-full rounded-3xl bg-ink px-5 py-4 text-base font-black text-chalk shadow-soft disabled:opacity-60">
        第四步：提交报名
      </button>
    </form>
  );
}
