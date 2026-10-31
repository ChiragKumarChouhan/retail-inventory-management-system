import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  {
    region: "North",
    sales: 183987,
  },
  {
    region: "South",
    sales: 105976,
  },
  {
    region: "East",
    sales: 36756,
  },
  {
    region: "West",
    sales: 55542,
  },
];

export default function RegionalSalesChart() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">
          Regional Sales
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Sales distribution across regions.
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#e5e7eb"
            />

            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "#6b7280",
              }}
            />

            <YAxis
              type="category"
              dataKey="region"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "#6b7280",
              }}
            />

            <Tooltip
              formatter={(value) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                "Sales",
              ]}
            />

            <Bar
              dataKey="sales"
              fill="#2563eb"
              radius={[0, 3, 3, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
