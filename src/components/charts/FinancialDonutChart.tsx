"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type DonutItem = { name: string; value: number; color: string };
type Props = { data: DonutItem[] };

export default function FinancialDonutChart({ data }: Props) {
  if (!data || data.length === 0) {
    return <div className="py-8 text-center text-xs text-slate-400">Belum ada data keuangan.</div>;
  }
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  const formatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(total);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={190}>
        <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={88}
            cornerRadius={28}
            paddingAngle={3}
            stroke="#FFFFFF"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "11px" }}
                        formatter={(value, name, item) => [new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value as number), item?.payload?.name || name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Saldo</p>
        <p className="text-base font-black text-[#0F766E]">{formatted}</p>
      </div>
    </div>
  );
}
