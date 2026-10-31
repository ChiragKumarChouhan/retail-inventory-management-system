import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatCompactCurrency(value) {
  const number = Number(value || 0);

  if (number >= 10000000) {
    return `₹${(number / 10000000).toFixed(1)}Cr`;
  }

  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(1)}L`;
  }

  if (number >= 1000) {
    return `₹${(number / 1000).toFixed(1)}K`;
  }

  return `₹${number}`;
}

export default function SalesPerformanceChart({ data = [] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="month"
            tick={{
              fontSize: 10,
              fill: "#6b7280",
            }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tick={{
              fontSize: 10,
              fill: "#6b7280",
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactCurrency}
          />

          <Tooltip
            formatter={(value) => [
              `₹${Number(value).toLocaleString("en-IN")}`,
              "Revenue",
            ]}
            labelFormatter={(label) => `Month: ${label}`}
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 5,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
