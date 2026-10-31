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
  { date: "24 Sep", revenue: 72000 },
  { date: "25 Sep", revenue: 84000 },
  { date: "26 Sep", revenue: 68000 },
  { date: "27 Sep", revenue: 95000 },
  { date: "28 Sep", revenue: 88000 },
  { date: "29 Sep", revenue: 112000 },
];

export default function RevenueTrendChart() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">Revenue Trend</h2>

        <p className="mt-1 text-xs text-gray-500">Daily revenue performance.</p>
      </div>

      <div className="h-[300px]">
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
              tickFormatter={(value) => `₹${value / 1000}k`}
            />

            <Tooltip
              formatter={(value) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                "Revenue",
              ]}
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
