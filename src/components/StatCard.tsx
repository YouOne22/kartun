import type { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon | ReactNode;
  bgColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  href?: string;
};

/**
 * Reusable stat card component for dashboard metrics.
 * Ensures consistent icon size, spacing, and layout.
 */
export default function StatCard({
  title,
  value,
  icon,
  bgColor = '#0F766E',
  trend,
  href,
}: StatCardProps) {
  const CardContent = (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p
              className={`mt-1 text-xs font-medium flex items-center gap-1 ${
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div
          className="flex items-center justify-center h-12 w-12 rounded-xl"
          style={{ backgroundColor: `${bgColor}15` }}
        >
          {typeof icon === 'function' ? (
            // @ts-ignore
            <icon className="h-6 w-6" style={{ color: bgColor }} />
          ) : (
            <span style={{ color: bgColor }}>{icon}</span>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-transform hover:-translate-y-1">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
