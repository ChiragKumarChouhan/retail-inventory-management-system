import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  IndianRupee,
  Loader2,
  Package,
  Receipt,
  ShoppingCart,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getSales } from "../api/salesApi";
import KpiCard from "../components/KpiCard";

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

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

export default function Sales() {
  const [sales, setSales] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("All");
  const [dateRange, setDateRange] = useState("All");

  /*
    Fetch sales from PostgreSQL
  */
  useEffect(() => {
    async function loadSales() {
      try {
        setLoading(true);
        setError("");

        const result = await getSales({
          category,
          dateRange,
        });

        if (!result.success) {
          throw new Error(result.message || "Failed to load sales");
        }

        setSales(result);
      } catch (err) {
        console.error("Sales fetch error:", err);

        setError(err.message || "Unable to load sales data.");
      } finally {
        setLoading(false);
      }
    }

    loadSales();
  }, [category, dateRange]);

  /*
    Categories from PostgreSQL
  */
  const categories = useMemo(() => {
    const names = sales?.categoryData?.map((item) => item.name) || [];

    return ["All", ...names];
  }, [sales]);

  /*
    Loading state
  */
  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2 size={25} className="mx-auto animate-spin text-blue-600" />

          <p className="mt-3 text-sm font-medium text-gray-700">
            Loading sales
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Fetching sales data from PostgreSQL...
          </p>
        </div>
      </div>
    );
  }

  /*
    Error state
  */
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle size={20} className="text-red-600" />
          </div>

          <h2 className="mt-4 text-sm font-semibold text-gray-900">
            Unable to load sales
          </h2>

          <p className="mt-2 text-xs leading-5 text-gray-500">{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const kpis = sales?.kpis || {};
  const revenueTrend = sales?.revenueTrend || [];
  const categoryData = sales?.categoryData || [];
  const regionalData = sales?.regionalData || [];
  const transactions = sales?.transactions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Sales Analytics
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Analyze revenue, orders and sales performance.
          </p>
        </div>

        <div className="flex gap-2">
          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="All">All</option>
            <option value="Today">Today</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
          </select>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(kpis.revenue)}
          change="Live"
          icon={IndianRupee}
        />

        <KpiCard
          title="Total Orders"
          value={Number(kpis.orders || 0).toLocaleString("en-IN")}
          change="Live"
          icon={ShoppingCart}
        />

        <KpiCard
          title="Units Sold"
          value={Number(kpis.unitsSold || 0).toLocaleString("en-IN")}
          change="Live"
          icon={Package}
        />

        <KpiCard
          title="Average Order Value"
          value={formatCurrency(kpis.averageOrderValue)}
          change="Live"
          icon={Receipt}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Revenue Trend
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Revenue over the selected period.
            </p>
          </div>

          <div className="h-[320px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid
                  stroke="#edf0f3"
                  vertical={false}
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#8991a0",
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={55}
                  tick={{
                    fontSize: 10,
                    fill: "#8991a0",
                  }}
                  tickFormatter={formatCompactCurrency}
                />

                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Revenue"]}
                  contentStyle={{
                    border: "1px solid #dfe3e8",
                    borderRadius: 4,
                    fontSize: 11,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#315efb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "#ffffff",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Sales by Category
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Revenue contribution by category.
            </p>
          </div>

          <div className="h-[320px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid
                  stroke="#edf0f3"
                  vertical={false}
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#697386",
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#8991a0",
                  }}
                  tickFormatter={formatCompactCurrency}
                />

                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Revenue"]}
                  contentStyle={{
                    border: "1px solid #dfe3e8",
                    borderRadius: 4,
                    fontSize: 11,
                  }}
                />

                <Bar
                  dataKey="revenue"
                  fill="#315efb"
                  radius={[3, 3, 0, 0]}
                  barSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Store Sales */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Store Sales</h2>

          <p className="mt-1 text-xs text-gray-500">
            Revenue generated by each store.
          </p>
        </div>

        <div className="h-[300px] p-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionalData}>
              <CartesianGrid
                stroke="#edf0f3"
                vertical={false}
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#697386",
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#8991a0",
                }}
                tickFormatter={formatCompactCurrency}
              />

              <Tooltip
                formatter={(value) => [formatCurrency(value), "Revenue"]}
                contentStyle={{
                  border: "1px solid #dfe3e8",
                  borderRadius: 4,
                  fontSize: 11,
                }}
              />

              <Bar
                dataKey="revenue"
                fill="#315efb"
                radius={[3, 3, 0, 0]}
                barSize={42}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Recent Transactions
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Latest sales transactions from PostgreSQL.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Order ID
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Date
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Product
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Category
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Store
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                  Quantity
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                  Revenue
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {transactions.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">
                    {item.orderId}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-500">
                    {item.date}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-gray-900">
                    {item.product}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {item.category}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {item.store}
                  </td>

                  <td className="px-5 py-4 text-right text-sm text-gray-700">
                    {Number(item.quantity || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(item.revenue)}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-gray-700">
              No transactions found
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Try changing your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
