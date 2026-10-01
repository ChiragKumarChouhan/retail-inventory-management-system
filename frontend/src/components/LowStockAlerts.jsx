const alerts = [
  {
    product: "Sony Bluetooth Speaker",
    stock: 8,
    reorder: 25,
    status: "Critical",
  },
  {
    product: "Dell Wireless Mouse",
    stock: 14,
    reorder: 30,
    status: "Low Stock",
  },
  {
    product: "Classmate Notebook Pack",
    stock: 11,
    reorder: 25,
    status: "Low Stock",
  },
  {
    product: "Philips LED Bulb 12W",
    stock: 5,
    reorder: 20,
    status: "Critical",
  },
];

function StatusBadge({ status }) {
  const styles =
    status === "Critical"
      ? "bg-red-50 text-red-700"
      : "bg-amber-50 text-amber-700";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}

export default function LowStockAlerts() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Low Stock Alerts
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Products requiring replenishment.
          </p>
        </div>

        <button className="text-sm font-medium text-blue-600">
          View Inventory
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                Product
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                Current Stock
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                Reorder Level
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                Status
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {alerts.map((item) => (
              <tr key={item.product} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">
                  {item.product}
                </td>

                <td className="px-5 py-4 text-sm text-gray-700">
                  {item.stock}
                </td>

                <td className="px-5 py-4 text-sm text-gray-700">
                  {item.reorder}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={item.status} />
                </td>

                <td className="px-5 py-4">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
