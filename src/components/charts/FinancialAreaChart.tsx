"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartPoint = { month: string; income: number; expense: number };
type Props = { data: ChartPoint[]; goal?: number };

const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

const tickFormatter = (v: number) => `Rp ${(v / 1000).toFixed(0)}rb`;

export default function FinancialAreaChart({ data, goal }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="area-income" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="area-expense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F97316" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} vertical={false} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
        <YAxis tickFormatter={tickFormatter} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickCount={5} />
        <Tooltip
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "11px" }}
                    formatter={(value, name) => [money.format(value as number), name === "income" ? "Pemasukan" : "Pengeluaran"]}
          labelClassName="text-[11px]"
        />
        {goal && (
          <foreignObject x="0" y="0" width="100%" height="100%">
            <div className="absolute top-2 right-3 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">Target: {tickFormatter(goal)}</div>
          </foreignObject>
        )}
        <Area type="monotone" dataKey="income" stroke="#059669" strokeWidth={2.5} fill="url(#area-income)" fillOpacity={1} dot={{ r: 3.5, strokeWidth: 0, fill: "#059669" }} activeDot={{ r: 5, strokeWidth: 0, fill: "#059669" }} />
        <Area type="monotone" dataKey="expense" stroke="#F97316" strokeWidth={2.5} fill="url(#area-expense)" fillOpacity={1} dot={{ r: 3.5, strokeWidth: 0, fill: "#F97316" }} activeDot={{ r: 5, strokeWidth: 0, fill: "#F97316" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
