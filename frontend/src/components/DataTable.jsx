import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DataTable({
  columns = [],
  data = [],
  rowKey = "id",
  emptyMessage = "No records found",
  page = 1,
  totalPages = 1,
  onPageChange,
}) {
  return (
    <div className="overflow-hidden rounded-md border border-[#dfe3e8] bg-white">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          {/* Header */}
          <thead>
            <tr className="border-b border-[#dfe3e8] bg-[#f8f9fb]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386] ${
                    column.align === "right"
                      ? "text-right"
                      : column.align === "center"
                        ? "text-center"
                        : "text-left"
                  }`}
                  style={{
                    width: column.width,
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-[#edf0f3]">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row[rowKey] ?? rowIndex}
                  className="group transition-colors hover:bg-[#fafbfc]"
                >
                  {columns.map((column) => {
                    const value = row[column.key];

                    return (
                      <td
                        key={column.key}
                        className={`px-4 py-3.5 text-[12px] text-[#4f5968] ${
                          column.align === "right"
                            ? "text-right"
                            : column.align === "center"
                              ? "text-center"
                              : "text-left"
                        }`}
                      >
                        {column.render
                          ? column.render(value, row, rowIndex)
                          : value}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-14 text-center">
                  <p className="text-sm font-medium text-[#4f5968]">
                    {emptyMessage}
                  </p>

                  <p className="mt-1 text-xs text-[#9299a5]">
                    There are no records matching the current view.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex min-h-[52px] items-center justify-between border-t border-[#e3e6eb] bg-white px-4">
        <p className="text-[11px] text-[#7b8492]">
          {data.length > 0
            ? `Showing ${data.length} record${data.length === 1 ? "" : "s"}`
            : "No records"}
        </p>

        {totalPages > 1 && onPageChange && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="flex h-7 w-7 items-center justify-center rounded border border-[#dfe3e8] text-[#687282] transition hover:bg-[#f5f6f8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="min-w-16 text-center text-[11px] font-medium text-[#596273]">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="flex h-7 w-7 items-center justify-center rounded border border-[#dfe3e8] text-[#687282] transition hover:bg-[#f5f6f8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
