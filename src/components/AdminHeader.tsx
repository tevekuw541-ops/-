import Link from "next/link";
import { LogOut } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-emerald-100 bg-[#f8f4e8]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/admin/applicants" className="font-black text-ink">黑板猫后台</Link>
        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link href="/admin/applicants" className="rounded-xl bg-white px-3 py-2 shadow-sm">报名列表</Link>
          <form action="/api/auth/logout" method="post">
            <button className="tap-pop inline-flex items-center gap-1 rounded-xl bg-ink px-3 py-2 text-chalk">
              <LogOut className="h-4 w-4" /> 退出
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
