import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function KpiCard({
  title,
  value,
  change,
  comparison = "vs previous period",
  icon: Icon,
}) {
  const isNegative = change?.startsWith("-");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
            {value}
          </h3>
        </div>

        <div className="rounded-md bg-gray-100 p-2.5">
          {Icon && (
            <Icon size={19} strokeWidth={1.8} className="text-gray-600" />
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`flex items-center gap-0.5 text-sm font-medium ${
            isNegative ? "text-red-600" : "text-green-600"
          }`}
        >
          {isNegative ? (
            <ArrowDownRight size={15} />
          ) : (
            <ArrowUpRight size={15} />
          )}

          {change}
        </span>

        <span className="text-xs text-gray-400">{comparison}</span>
      </div>
    </div>
  );
}
