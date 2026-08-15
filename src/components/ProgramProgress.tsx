import { TrendingUp } from "lucide-react";

type Program = {
  label: string;
  total: number;
  current: number;
  color: string;
};

type Props = { programs: Program[] };

export default function ProgramProgress({ programs }: Props) {
  return (
    <div className="space-y-4">
      {programs.map((p, i) => {
        const pct = p.total > 0 ? Math.min(Math.round((p.current / p.total) * 100), 100) : 0;
        return (
          <div key={i}>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-xs font-semibold text-slate-700">{p.label}</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500">{pct}%</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: p.color }}
              />
            </div>
            <div className="mt-1 flex items-center justify-end gap-1">
              <span className="text-[10px] text-slate-400">{p.current}/{p.total}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
