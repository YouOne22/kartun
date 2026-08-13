import type { ReactNode } from 'react';

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
};

type ResponsiveTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  className?: string;
};

/**
 * Responsive table component that adapts to mobile viewports.
 * On desktop: traditional table layout.
 * On mobile (< 768px): card-based layout with labeled fields.
 */
export default function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'Data tidak ditemukan.',
  loading = false,
  loadingMessage = 'Memuat data...',
  className = '',
}: ResponsiveTableProps<T>) {
  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        {loadingMessage}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  const visibleColumns = columns.filter((col) => !col.hideOnMobile);

  return (
    <div className={`overflow-x-auto ${className}`}>
      {/* Desktop Table */}
      <table className="w-full min-w-[820px] text-left text-sm hidden lg:table">
        <thead className="border-b border-slate-100 text-xs text-slate-500">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-3 py-3 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-slate-50">
              {columns.map((col) => (
                <td key={col.key} className={`px-3 py-3 ${col.className || ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-3">
        {data.map((row) => (
          <div
            key={keyExtractor(row)}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            {visibleColumns.map((col) => (
              <div
                key={col.key}
                className="flex flex-col gap-1 py-2 border-t border-slate-100 first:border-0"
              >
                <span className="text-xs font-medium text-slate-500">
                  {col.header}
                </span>
                <span className="text-sm text-slate-800">{col.render(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}