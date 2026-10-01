const products = [
  {
    name: "Samsung 55-inch Smart TV",
    category: "Electronics",
    units: 342,
    revenue: 256800,
    stock: 42,
  },
  {
    name: "LG Double Door Refrigerator",
    category: "Home Appliances",
    units: 286,
    revenue: 214500,
    stock: 28,
  },
  {
    name: "Boat Wireless Headphones",
    category: "Accessories",
    units: 624,
    revenue: 187200,
    stock: 86,
  },
  {
    name: "HP Wireless Keyboard",
    category: "Office Supplies",
    units: 418,
    revenue: 125400,
    stock: 64,
  },
  {
    name: "Dove Personal Care Pack",
    category: "Personal Care",
    units: 382,
    revenue: 76400,
    stock: 112,
  },
];

export default function TopSellingProducts() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Top Selling Products
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Products generating the highest sales volume.
          </p>
        </div>

        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                Product
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                Category
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                Units Sold
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                Revenue
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                Stock
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.name} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-900">
                    {product.name}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-gray-500">
                  {product.category}
                </td>

                <td className="px-5 py-4 text-sm text-gray-700">
                  {product.units.toLocaleString()}
                </td>

                <td className="px-5 py-4 text-sm font-medium text-gray-900">
                  ₹{product.revenue.toLocaleString("en-IN")}
                </td>

                <td className="px-5 py-4 text-sm text-gray-700">
                  {product.stock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
