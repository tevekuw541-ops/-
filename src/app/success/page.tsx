import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CatMascot } from "@/components/CatMascot";

export default function SuccessPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <CatMascot />
      <div className="mt-8 rounded-[2rem] bg-white p-7 shadow-soft">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
        <h1 className="text-3xl font-black text-ink">报名成功！</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          黑板猫已经收到你的课表啦，管理员会根据你的空闲时间联系你。记得留意微信和电话。
        </p>
        <Link href="/" className="tap-pop mt-6 inline-flex rounded-2xl bg-ink px-5 py-3 font-bold text-chalk">
          返回首页
        </Link>
      </div>
    </main>
  );
}
