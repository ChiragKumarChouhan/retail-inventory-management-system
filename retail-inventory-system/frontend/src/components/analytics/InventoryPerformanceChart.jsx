import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Apr", stock: 7200 },
  { month: "May", stock: 7850 },
  { month: "Jun", stock: 7420 },
  { month: "Jul", stock: 8100 },
  { month: "Aug", stock: 8650 },
  { month: "Sep", stock: 8420 },
];

export default function InventoryPerformanceChart() {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />

          <Tooltip
            formatter={(value) => [
              Number(value).toLocaleString("en-IN"),
              "Inventory Units",
            ]}
          />

          <Bar dataKey="stock" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
