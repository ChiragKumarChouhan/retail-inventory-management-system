import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { date: "01 Sep", revenue: 32000 },
  { date: "05 Sep", revenue: 41000 },
  { date: "09 Sep", revenue: 36000 },
  { date: "13 Sep", revenue: 52000 },
  { date: "17 Sep", revenue: 48000 },
  { date: "21 Sep", revenue: 61000 },
  { date: "25 Sep", revenue: 57000 },
  { date: "29 Sep", revenue: 69000 },
];

function formatRevenue(value) {
  return `₹${(value / 1000).toFixed(0)}k`;
}

export default function SalesTrendChart() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">Sales Trend</h2>

        <p className="mt-1 text-xs text-gray-500">
          Revenue performance over the selected period.
        </p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "#6b7280",
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "#6b7280",
              }}
              tickFormatter={formatRevenue}
            />

            <Tooltip
              formatter={(value) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                "Revenue",
              ]}
              contentStyle={{
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
