"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { days, periods, slotLabel } from "@/lib/slots";

const colors = ["#173d36", "#ff7a59", "#ffd166", "#8ee6c9", "#64748b"];

export function ApplicantListCharts({
  byGrade,
  byGender,
  byStatus,
  bySlot
}: {
  byGrade: { name: string; count: number }[];
  byGender: { name: string; value: number }[];
  byStatus: { name: string; count: number }[];
  bySlot: { key: string; count: number }[];
}) {
  const slotData = bySlot
    .map((item) => {
      const [day, period] = item.key.split("|");
      return { name: slotLabel(day, period).replace(" 节", ""), count: item.count };
    })
    .sort((a, b) => {
      const order = days.flatMap((day) =>
        periods.map((period) => slotLabel(day.key, period.key).replace(" 节", ""))
      );
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

  return (
    <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr_1.4fr]">
      <ChartCard title="当前结果年级分布">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byGrade}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#173d36" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="性别比例">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={byGender} dataKey="value" nameKey="name" innerRadius={46} outerRadius={78} label>
              {byGender.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="空闲节次人数">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={slotData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={72} fontSize={11} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#ff7a59" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="联系状态" className="xl:col-span-3">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={byStatus}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#8ee6c9" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </section>
  );
}

function ChartCard({
  title,
  className = "",
  children
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl bg-white p-4 shadow-soft ${className}`}>
      <h2 className="mb-3 font-black text-ink">{title}</h2>
      {children}
    </section>
  );
}
