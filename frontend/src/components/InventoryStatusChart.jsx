import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const data = [
  {
    name: "Healthy",
    value: 58,
  },
  {
    name: "Low Stock",
    value: 22,
  },
  {
    name: "Critical",
    value: 12,
  },
  {
    name: "Out of Stock",
    value: 8,
  },
];

const COLORS = ["#16a34a", "#f59e0b", "#ef4444", "#6b7280"];

export default function InventoryStatusChart() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Inventory Status
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Current stock health across products.
        </p>
      </div>

      <div className="mt-4 flex flex-col items-center justify-center sm:flex-row">
        <div className="h-[230px] w-full sm:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full space-y-3 sm:w-1/2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: COLORS[index],
                  }}
                />

                <span className="text-sm text-gray-600">{item.name}</span>
              </div>

              <span className="text-sm font-semibold text-gray-800">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
