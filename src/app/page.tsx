import { Bike, CalendarCheck, Coins, MapPin } from "lucide-react";
import { ApplicantForm } from "@/components/ApplicantForm";
import { CatMascot } from "@/components/CatMascot";
import { getGradeOptions } from "@/lib/grades";

export default function Home() {
  const perks = [
    { icon: Coins, title: "薪资周结", text: "课余时间也能稳稳回血" },
    { icon: CalendarCheck, title: "时间灵活", text: "按课表匹配空闲时段" },
    { icon: MapPin, title: "校内配送", text: "路线熟，距离近" },
    { icon: Bike, title: "轻松上手", text: "有无经验都可报名" }
  ];

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-5">
      <section className="chalkboard relative overflow-hidden rounded-[2rem] p-6 text-chalk shadow-soft">
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full border border-dashed border-chalk/30" />
        <div className="relative z-10">
          <p className="text-sm font-bold text-yolk">黑板猫校园外卖</p>
          <h1 className="mt-2 text-4xl font-black leading-tight">校园兼职招募中</h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-chalk/80">
            上传课表，黑板猫帮你匹配适合的配送时段。
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          <CatMascot />
        </div>
      </section>

      <section className="my-5 grid grid-cols-2 gap-3">
        {perks.map((perk) => (
          <div key={perk.title} className="tap-pop rounded-3xl bg-white p-4 shadow-soft">
            <perk.icon className="mb-3 h-6 w-6 text-coral" />
            <h2 className="font-black">{perk.title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">{perk.text}</p>
          </div>
        ))}
      </section>

      <ApplicantForm grades={getGradeOptions()} />
      <p className="py-8 text-center text-xs text-slate-400">手机号和微信号仅管理员登录后可见</p>
    </main>
  );
}
