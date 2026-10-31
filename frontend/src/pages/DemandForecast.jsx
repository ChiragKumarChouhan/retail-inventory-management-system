import { useEffect, useMemo, useState } from "react";

import {
  TrendingUp,
  Package,
  CalendarDays,
  ShoppingCart,
  Eye,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { getForecast } from "../api/forecastApi";

export default function DemandForecast() {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [period, setPeriod] = useState("7");

  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [orders, setOrders] = useState([]);

  // --------------------------------------------------
  // Fetch forecast data
  // --------------------------------------------------

  useEffect(() => {
    async function loadForecast() {
      try {
        setLoading(true);
        setError("");

        const result = await getForecast({
          productId: selectedProduct,
          period: Number(period),
        });

        if (!result.success) {
          throw new Error(result.message || "Failed to load forecast data");
        }

        setForecast(result);

        // If no product is selected yet,
        // select the first product returned by API.
        if (!selectedProduct && result.products?.length > 0) {
          setSelectedProduct(result.products[0].productId);
        }
      } catch (err) {
        console.error("Forecast fetch error:", err);

        setError(err.message || "Unable to load forecast data.");
      } finally {
        setLoading(false);
      }
    }

    loadForecast();
  }, [selectedProduct, period]);

  // --------------------------------------------------
  // Selected product
  // --------------------------------------------------

  const product = forecast?.selectedProduct || null;

  const products = forecast?.products || [];

  // --------------------------------------------------
  // Chart data
  // --------------------------------------------------

  const chartData = useMemo(() => {
    if (!product || !forecast) {
      return [];
    }

    const historical = forecast.historical || [];
    const futureForecast = forecast.forecast || [];

    const historicalData = historical.map((item) => ({
      day: item.date,
      historical: Number(item.demand || 0),
      forecast: null,
    }));

    const forecastData = futureForecast.map((item) => ({
      day: item.date,
      historical: null,
      forecast: Number(item.demand || 0),
    }));

    return [...historicalData, ...forecastData];
  }, [forecast, product]);

  // --------------------------------------------------
  // Create purchase order
  // --------------------------------------------------

  function handleCreateOrder(item) {
    const productId = item.productId;

    if (orders.includes(productId)) {
      return;
    }

    setOrders((previous) => [...previous, productId]);

    alert(
      `Purchase order created for ${item.product} - ${item.recommendedOrder} units.`,
    );
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2 size={25} className="mx-auto animate-spin text-[#315efb]" />

          <p className="mt-3 text-sm font-medium text-[#4f5968]">
            Loading demand forecast
          </p>

          <p className="mt-1 text-xs text-[#8991a0]">
            Fetching live data from PostgreSQL...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1f1]">
            <AlertTriangle size={20} className="text-[#c24141]" />
          </div>

          <h2 className="mt-4 text-sm font-semibold text-[#172033]">
            Unable to load forecast
          </h2>

          <p className="mt-2 text-xs leading-5 text-[#7b8492]">{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 h-9 rounded-md border border-[#dfe3e8] bg-white px-4 text-xs font-medium text-[#4f5968] hover:bg-[#f7f8fa]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Demand Forecast
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Forecast future product demand and plan inventory replenishment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays size={17} className="text-gray-500" />

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="7">Next 7 Days</option>

            <option value="30">Next 30 Days</option>

            <option value="90">Next 90 Days</option>
          </select>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Product */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Product
            </label>

            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
            >
              {products.map((item) => (
                <option key={item.productId} value={item.productId}>
                  {item.product} ({item.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Forecast Period */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Forecast Period
            </label>

            <div className="flex h-10 overflow-hidden rounded-md border border-gray-200">
              {["7", "30", "90"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPeriod(item)}
                  className={`flex-1 text-sm font-medium ${
                    period === item
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item} Days
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {product && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Average Daily Demand */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Average Daily Demand</p>

              <TrendingUp size={19} className="text-gray-500" />
            </div>

            <p className="mt-3 text-2xl font-semibold text-gray-900">
              {Number(product.averageDailyDemand || 0).toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-gray-500">units per day</p>
          </div>

          {/* Predicted Demand */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Predicted Demand</p>

              <TrendingUp size={19} className="text-gray-500" />
            </div>

            <p className="mt-3 text-2xl font-semibold text-gray-900">
              {Number(product.predictedDemand || 0).toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs text-gray-500">next {period} days</p>
          </div>

          {/* Current Stock */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Current Stock</p>

              <Package size={19} className="text-gray-500" />
            </div>

            <p className="mt-3 text-2xl font-semibold text-gray-900">
              {Number(product.currentStock || 0).toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs text-gray-500">units available</p>
          </div>

          {/* Recommended Order */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Recommended Order</p>

              <ShoppingCart size={19} className="text-gray-500" />
            </div>

            <p className="mt-3 text-2xl font-semibold text-blue-600">
              {Number(product.recommendedOrder || 0).toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs text-gray-500">units to reorder</p>
          </div>
        </div>
      )}

      {/* Forecast Chart */}
      {product && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Demand Forecast
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Historical demand compared with predicted demand for{" "}
              <span className="font-medium">{product.product}</span>
            </p>
          </div>

          <div className="p-5">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="historical"
                    name="Historical Demand"
                    stroke="#6b7280"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="Forecast"
                    stroke="#2563eb"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation */}
      {product && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Replenishment Recommendation
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Based on current stock and predicted demand,{" "}
                <span className="font-medium">
                  {Number(product.recommendedOrder || 0).toLocaleString(
                    "en-IN",
                  )}{" "}
                  units
                </span>{" "}
                are recommended for reorder.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCreateOrder(product)}
              disabled={orders.includes(product.productId)}
              className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white ${
                orders.includes(product.productId)
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <ShoppingCart size={16} />

              {orders.includes(product.productId)
                ? "Order Created"
                : "Create Order"}
            </button>
          </div>
        </div>
      )}

      {/* Reorder Recommendations */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Reorder Recommendations
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Products requiring inventory replenishment
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Product
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  SKU
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Current Stock
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Avg. Daily Demand
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Predicted Demand
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Recommended Order
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {products.map((item) => (
                <tr key={item.productId} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {item.product}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-500">
                    {item.sku}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-700">
                    {Number(item.currentStock || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-700">
                    {Number(item.averageDailyDemand || 0).toFixed(2)}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-gray-900">
                    {Number(item.predictedDemand || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-semibold text-blue-600">
                      {Number(item.recommendedOrder || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(item.productId)}
                        className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <Eye size={14} />
                        Review
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCreateOrder(item)}
                        disabled={orders.includes(item.productId)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium text-white ${
                          orders.includes(item.productId)
                            ? "cursor-not-allowed bg-gray-400"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {orders.includes(item.productId)
                          ? "Created"
                          : "Create Order"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-gray-700">
                      No forecast data available
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      No products were returned by the forecast API.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
