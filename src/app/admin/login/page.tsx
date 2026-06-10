import { LoginForm } from "@/components/LoginForm";
import { CatMascot } from "@/components/CatMascot";
import { adminCredentialsHint } from "@/lib/auth";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <div className="mb-6 flex items-center gap-4">
        <CatMascot />
        <div>
          <p className="text-sm font-bold text-coral">黑板猫后台</p>
          <h1 className="text-3xl font-black text-ink">管理员登录</h1>
        </div>
      </div>
      <LoginForm />
      <p className="mt-4 rounded-2xl bg-white/70 p-4 text-xs leading-6 text-slate-500">
        本地默认账号：{adminCredentialsHint.username}；默认密码：{adminCredentialsHint.password}。上线前请在环境变量中修改。
      </p>
    </main>
  );
}
