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
    category: "Electronics",
    sales: 164997,
  },
  {
    category: "Accessories",
    sales: 48978,
  },
  {
    category: "Home Appliances",
    sales: 47974,
  },
  {
    category: "Office Supplies",
    sales: 16477,
  },
  {
    category: "Personal Care",
    sales: 4788,
  },
  {
    category: "Grocery",
    sales: 6500,
  },
];

export default function SalesCategoryChart() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">
          Sales by Category
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Revenue contribution by category.
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
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
                "Sales",
              ]}
            />

            <Bar
              dataKey="sales"
              fill="#2563eb"
              radius={[3, 3, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
