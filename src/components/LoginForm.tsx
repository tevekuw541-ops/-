"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: form.get("username"), password: form.get("password") })
    });
    setLoading(false);
    if (!response.ok) {
      setError("账号或密码不正确");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[2rem] bg-white p-6 shadow-soft">
      <input name="username" placeholder="管理员账号" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400" />
      <input name="password" type="password" placeholder="管理员密码" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400" />
      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}
      <button disabled={loading} className="tap-pop inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 font-black text-chalk disabled:opacity-60">
        <LogIn className="h-4 w-4" /> {loading ? "登录中..." : "进入后台"}
      </button>
    </form>
  );
}
