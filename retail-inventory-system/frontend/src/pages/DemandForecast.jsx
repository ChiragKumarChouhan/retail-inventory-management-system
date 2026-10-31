import { useEffect, useMemo, useState } from "react";

import {
  TrendingUp,
  Package,
  CalendarDays,
  ShoppingCart,
  Eye,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock3,
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

const ORDERS_STORAGE_KEY = "rims_purchase_orders";
const FORECAST_PRODUCT_KEY = "rims_forecast_product";
const FORECAST_PERIOD_KEY = "rims_forecast_period";

export default function DemandForecast() {
  const [selectedProduct, setSelectedProduct] = useState(
    () => localStorage.getItem(FORECAST_PRODUCT_KEY) || "",
  );

  const [period, setPeriod] = useState(
    () => localStorage.getItem(FORECAST_PERIOD_KEY) || "7",
  );

  const [forecast, setForecast] = useState(null);

  // Full-page loading only happens on the first load.
  const [loading, setLoading] = useState(true);

  // Used when changing product/period after the page is already loaded.
  const [refreshingForecast, setRefreshingForecast] = useState(false);

  const [error, setError] = useState("");

  /*
    Orders are stored in localStorage so they survive refresh.
  */
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);

      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [notification, setNotification] = useState("");

  // --------------------------------------------------
  // Save orders whenever they change
  // --------------------------------------------------

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  // --------------------------------------------------
  // Save selected product
  // --------------------------------------------------

  useEffect(() => {
    if (selectedProduct) {
      localStorage.setItem(FORECAST_PRODUCT_KEY, selectedProduct);
    }
  }, [selectedProduct]);

  // --------------------------------------------------
  // Save forecast period
  // --------------------------------------------------

  useEffect(() => {
    localStorage.setItem(FORECAST_PERIOD_KEY, period);
  }, [period]);

  // --------------------------------------------------
  // Load forecast
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadForecast() {
      try {
        /*
          IMPORTANT:

          First page load:
          show the full loading screen.

          Changing product/period:
          keep the existing page visible and show
          only a small "Updating forecast..." indicator.
        */
        if (forecast) {
          setRefreshingForecast(true);
        } else {
          setLoading(true);
        }

        setError("");

        const result = await getForecast({
          productId: selectedProduct,
          period: Number(period),
        });

        if (cancelled) return;

        if (!result.success) {
          throw new Error(result.message || "Failed to load forecast data");
        }

        setForecast(result);

        /*
          If no product is selected yet,
          select the first product returned by API.
        */
        if (!selectedProduct && result.products?.length > 0) {
          setSelectedProduct(result.products[0].productId);
        }

        /*
          If saved product no longer exists,
          select the first available product.
        */
        if (
          selectedProduct &&
          result.products?.length > 0 &&
          !result.products.some((item) => item.productId === selectedProduct)
        ) {
          setSelectedProduct(result.products[0].productId);
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Forecast fetch error:", err);

        setError(err.message || "Unable to load forecast data.");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshingForecast(false);
        }
      }
    }

    loadForecast();

    return () => {
      cancelled = true;
    };
  }, [selectedProduct, period]);

  // --------------------------------------------------
  // Selected product
  // --------------------------------------------------

  const product = forecast?.selectedProduct || null;

  const products = forecast?.products || [];

  // --------------------------------------------------
  // Sort recommendations
  // --------------------------------------------------

  const sortedProducts = useMemo(() => {
    return [...products].sort(
      (a, b) =>
        Number(b.recommendedOrder || 0) - Number(a.recommendedOrder || 0),
    );
  }, [products]);

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
  // Create order
  // --------------------------------------------------

  function handleCreateOrder(item) {
    const productId = item.productId;

    // Prevent duplicate order creation.
    if (orders[productId]) {
      return;
    }

    const order = {
      productId,
      product: item.product || productId,
      sku: item.sku || productId,
      quantity: Number(item.recommendedOrder || 0),
      createdAt: new Date().toISOString(),
      status: "Created",
    };

    setOrders((previous) => ({
      ...previous,
      [productId]: order,
    }));

    setNotification(`Purchase order created for ${item.product || productId}.`);

    setTimeout(() => {
      setNotification("");
    }, 3500);
  }

  // --------------------------------------------------
  // Check order status
  // --------------------------------------------------

  function isOrderCreated(productId) {
    return Boolean(orders[productId]);
  }

  // --------------------------------------------------
  // Review product
  // --------------------------------------------------

  function handleReview(productId) {
    /*
      Change the selected product.
      This triggers the forecast API.
    */
    setSelectedProduct(productId);

    /*
      Scroll to the forecast chart after React
      updates the selected product.
    */
    setTimeout(() => {
      document.getElementById("forecast-chart")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  }

  // --------------------------------------------------
  // Loading screen
  //
  // This is ONLY for the initial page load.
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

  if (error && !forecast) {
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

  return (
    <div className="space-y-5">
      {/* --------------------------------------------------
          Notification
      -------------------------------------------------- */}

      {notification && (
        <div className="fixed right-5 top-5 z-50 flex items-center gap-3 rounded-lg border border-[#cce8d6] bg-white px-4 py-3 shadow-lg">
          <CheckCircle2 size={18} className="text-[#23834b]" />

          <div>
            <p className="text-xs font-semibold text-[#172033]">
              Order created
            </p>

            <p className="mt-0.5 text-[11px] text-[#697386]">{notification}</p>
          </div>
        </div>
      )}

      {/* --------------------------------------------------
          Header
      -------------------------------------------------- */}

      <div className="flex flex-col justify-between gap-4 border-b border-[#e3e6eb] pb-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8991a0]">
            Planning
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[#172033]">
            Demand Forecast
          </h1>

          <p className="mt-1 text-sm text-[#7b8492]">
            Review demand trends and plan inventory replenishment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-[#7b8492]" />

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-9 rounded-md border border-[#dfe3e8] bg-white px-3 text-xs font-medium text-[#4f5968] outline-none focus:border-[#315efb]"
          >
            <option value="7">Next 7 Days</option>

            <option value="30">Next 30 Days</option>

            <option value="90">Next 90 Days</option>
          </select>
        </div>
      </div>

      {/* --------------------------------------------------
          Controls
      -------------------------------------------------- */}

      <div className="border border-[#dfe3e8] bg-white p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Product */}

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
              Product
            </label>

            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="h-10 w-full rounded-md border border-[#dfe3e8] bg-white px-3 text-xs text-[#4f5968] outline-none focus:border-[#315efb]"
            >
              {products.map((item) => (
                <option key={item.productId} value={item.productId}>
                  {item.product} ({item.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Period */}

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
              Forecast Period
            </label>

            <div className="flex h-10 overflow-hidden rounded-md border border-[#dfe3e8]">
              {["7", "30", "90"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPeriod(item)}
                  className={`flex-1 text-xs font-medium ${
                    period === item
                      ? "bg-[#315efb] text-white"
                      : "bg-white text-[#697386] hover:bg-[#f7f8fa]"
                  }`}
                >
                  {item} Days
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------
          Updating indicator
      -------------------------------------------------- */}

      {refreshingForecast && (
        <div className="flex items-center gap-2 border border-[#d9e4ff] bg-[#f5f8ff] px-4 py-2.5 text-xs text-[#315efb]">
          <Loader2 size={14} className="animate-spin" />
          Updating forecast data...
        </div>
      )}

      {/* --------------------------------------------------
          KPI Cards
      -------------------------------------------------- */}

      {product && (
        <div className="grid grid-cols-2 border border-[#dfe3e8] bg-white xl:grid-cols-4">
          <div className="border-b border-[#e3e6eb] px-4 py-4 xl:border-b-0 xl:border-r">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8991a0]">
                Avg. Daily Demand
              </p>

              <TrendingUp size={16} className="text-[#697386]" />
            </div>

            <p className="mt-2 text-2xl font-semibold text-[#172033]">
              {Number(product.averageDailyDemand || 0).toFixed(2)}
            </p>

            <p className="mt-1 text-[11px] text-[#8991a0]">units per day</p>
          </div>

          <div className="border-b border-[#e3e6eb] px-4 py-4 xl:border-b-0 xl:border-r">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8991a0]">
                Predicted Demand
              </p>

              <TrendingUp size={16} className="text-[#697386]" />
            </div>

            <p className="mt-2 text-2xl font-semibold text-[#172033]">
              {Number(product.predictedDemand || 0).toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-[11px] text-[#8991a0]">
              next {period} days
            </p>
          </div>

          <div className="border-r border-[#e3e6eb] px-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8991a0]">
                Current Stock
              </p>

              <Package size={16} className="text-[#697386]" />
            </div>

            <p className="mt-2 text-2xl font-semibold text-[#172033]">
              {Number(product.currentStock || 0).toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-[11px] text-[#8991a0]">units available</p>
          </div>

          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8991a0]">
                Recommended Order
              </p>

              <ShoppingCart size={16} className="text-[#315efb]" />
            </div>

            <p className="mt-2 text-2xl font-semibold text-[#315efb]">
              {Number(product.recommendedOrder || 0).toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-[11px] text-[#8991a0]">units to reorder</p>
          </div>
        </div>
      )}

      {/* --------------------------------------------------
          Forecast Chart
      -------------------------------------------------- */}

      {product && (
        <div
          id="forecast-chart"
          className="relative overflow-hidden border border-[#dfe3e8] bg-white"
        >
          <div className="flex flex-col justify-between gap-2 border-b border-[#e3e6eb] px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-[13px] font-semibold text-[#172033]">
                Demand Trend
              </h2>

              <p className="mt-1 text-[11px] text-[#8991a0]">
                Historical demand and projected demand for {product.product}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {refreshingForecast && (
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#315efb]">
                  <Loader2 size={12} className="animate-spin" />
                  Updating
                </div>
              )}

              <div className="flex items-center gap-2 text-[10px] text-[#8991a0]">
                <Clock3 size={13} />
                Dataset date:{" "}
                {forecast?.latestDate
                  ? new Date(forecast.latestDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 10,
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 10,
                    }}
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
                    dot={false}
                    connectNulls={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="Forecast"
                    stroke="#315efb"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Small overlay while changing product */}
          {refreshingForecast && (
            <div className="absolute inset-0 top-[65px] flex items-center justify-center bg-white/60">
              <div className="flex items-center gap-2 rounded-md border border-[#dfe3e8] bg-white px-4 py-2 text-xs font-medium text-[#4f5968] shadow-sm">
                <Loader2 size={14} className="animate-spin text-[#315efb]" />
                Loading updated forecast...
              </div>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------
          Recommendation
      -------------------------------------------------- */}

      {product && (
        <div className="border border-[#cfe0ff] bg-[#f5f8ff] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingCart size={17} className="text-[#315efb]" />

                <h2 className="text-sm font-semibold text-[#172033]">
                  Replenishment Recommendation
                </h2>
              </div>

              <p className="mt-2 text-xs leading-5 text-[#697386]">
                Based on current stock and predicted demand,{" "}
                <span className="font-semibold text-[#172033]">
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
              disabled={isOrderCreated(product.productId)}
              className={`flex h-10 items-center justify-center gap-2 rounded-md px-4 text-xs font-medium text-white ${
                isOrderCreated(product.productId)
                  ? "cursor-not-allowed bg-[#8b95a5]"
                  : "bg-[#315efb] hover:bg-[#244bd5]"
              }`}
            >
              {isOrderCreated(product.productId) ? (
                <>
                  <CheckCircle2 size={15} />
                  Order Created
                </>
              ) : (
                <>
                  <ShoppingCart size={15} />
                  Create Order
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------
          Reorder Recommendations
      -------------------------------------------------- */}

      <div className="overflow-hidden border border-[#dfe3e8] bg-white">
        <div className="flex flex-col justify-between gap-2 border-b border-[#e3e6eb] px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[13px] font-semibold text-[#172033]">
              Reorder Recommendations
            </h2>

            <p className="mt-1 text-[11px] text-[#8991a0]">
              Products requiring inventory replenishment
            </p>
          </div>

          <div className="text-[11px] text-[#8991a0]">
            {sortedProducts.length} products
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="border-b border-[#e3e6eb] bg-[#f8f9fb]">
              <tr>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
                  Product
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
                  SKU
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
                  Current Stock
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
                  Avg. Daily Demand
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
                  Predicted Demand
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
                  Recommended Order
                </th>

                <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#edf0f3]">
              {sortedProducts.map((item) => {
                const orderCreated = isOrderCreated(item.productId);

                return (
                  <tr
                    key={item.productId}
                    className="transition-colors hover:bg-[#fafbfc]"
                  >
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-[#172033]">
                        {item.product}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-xs text-[#697386]">
                      {item.sku}
                    </td>

                    <td className="px-5 py-4 text-xs text-[#4f5968]">
                      {Number(item.currentStock || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-xs text-[#4f5968]">
                      {Number(item.averageDailyDemand || 0).toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-[#172033]">
                      {Number(item.predictedDemand || 0).toLocaleString(
                        "en-IN",
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-semibold ${
                          Number(item.recommendedOrder || 0) > 0
                            ? "text-[#315efb]"
                            : "text-[#697386]"
                        }`}
                      >
                        {Number(item.recommendedOrder || 0).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {/* Review */}

                        <button
                          type="button"
                          onClick={() => handleReview(item.productId)}
                          className="flex items-center gap-1.5 rounded-md border border-[#dfe3e8] px-3 py-1.5 text-xs font-medium text-[#697386] hover:bg-[#f7f8fa]"
                        >
                          <Eye size={14} />
                          Review
                        </button>

                        {/* Create Order */}

                        <button
                          type="button"
                          onClick={() => handleCreateOrder(item)}
                          disabled={orderCreated}
                          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white ${
                            orderCreated
                              ? "cursor-not-allowed bg-[#8b95a5]"
                              : "bg-[#315efb] hover:bg-[#244bd5]"
                          }`}
                        >
                          {orderCreated ? (
                            <>
                              <CheckCircle2 size={13} />
                              Created
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={13} />
                              Create Order
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {sortedProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-[#4f5968]">
                      No forecast data available
                    </p>

                    <p className="mt-1 text-xs text-[#9299a5]">
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
