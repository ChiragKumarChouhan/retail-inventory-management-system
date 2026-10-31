import { useEffect, useState } from "react";

import {
  AlertTriangle,
  IndianRupee,
  Loader2,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import InventoryPerformanceChart from "../components/analytics/InventoryPerformanceChart";
import ProductPerformanceChart from "../components/analytics/ProductPerformanceChart";
import SalesPerformanceChart from "../components/analytics/SalesPerformanceChart";

import { getAnalytics } from "../api/analyticsApi";

// --------------------------------------------------
// Currency formatting
// --------------------------------------------------

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

// --------------------------------------------------
// Compact currency formatting
// --------------------------------------------------

function formatCompactCurrency(value) {
  const number = Number(value || 0);

  if (number >= 10000000) {
    return `₹${(number / 10000000).toFixed(2)}Cr`;
  }

  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(2)}L`;
  }

  if (number >= 1000) {
    return `₹${(number / 1000).toFixed(1)}K`;
  }

  return `₹${number}`;
}

// --------------------------------------------------
// Metric Card
// --------------------------------------------------

function MetricCard({ title, value, change, positive, icon: Icon }) {
  return (
    <div className="border border-[#dfe3e8] bg-white px-5 py-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#7b8492]">
            {title}
          </p>

          <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[#172033]">
            {value}
          </h3>
        </div>

        <div className="flex h-8 w-8 items-center justify-center border border-[#e3e6eb] bg-[#fafbfc] text-[#596273]">
          <Icon size={16} strokeWidth={1.8} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {positive ? (
          <TrendingUp size={14} className="text-[#16845b]" />
        ) : (
          <TrendingDown size={14} className="text-[#c24141]" />
        )}

        <span
          className={`text-[11px] font-medium ${
            positive ? "text-[#16845b]" : "text-[#c24141]"
          }`}
        >
          {change}
        </span>

        <span className="text-[11px] text-[#9299a5]">vs previous period</span>
      </div>
    </div>
  );
}

// --------------------------------------------------
// Analytics Page
// --------------------------------------------------

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ------------------------------------------------
  // Fetch analytics data
  // ------------------------------------------------

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const result = await getAnalytics();

        console.log("ANALYTICS API RESULT:", result);

        console.log("ANALYTICS KPI DATA:", result.kpis);

        if (!result.success) {
          throw new Error(result.message || "Failed to load analytics");
        }

        setAnalytics(result);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        console.error("Analytics fetch error:", err);

        setError(err.message || "Unable to load analytics data.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      controller.abort();
    };
  }, []);

  // ------------------------------------------------
  // Loading state
  // ------------------------------------------------

  if (loading) {
    return (
      <div className="mx-auto max-w-[1600px]">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <Loader2
              size={25}
              className="mx-auto animate-spin text-[#315efb]"
            />

            <p className="mt-3 text-sm font-medium text-[#4f5968]">
              Loading analytics
            </p>

            <p className="mt-1 text-xs text-[#8991a0]">
              Fetching live data from PostgreSQL...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------
  // Error state
  // ------------------------------------------------

  if (error) {
    return (
      <div className="mx-auto max-w-[1600px]">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1f1]">
              <AlertTriangle size={20} className="text-[#c24141]" />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[#172033]">
              Unable to load analytics
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
      </div>
    );
  }

  // ------------------------------------------------
  // IMPORTANT:
  // API returns "kpis", NOT "metrics"
  // ------------------------------------------------

  const kpis = analytics?.kpis || {};

  const salesPerformance = analytics?.salesPerformance || [];

  const inventoryPerformance = analytics?.inventoryPerformance || [];

  const productPerformance = analytics?.productPerformance || [];

  const topProducts = analytics?.topProducts || [];

  const slowProducts = analytics?.slowProducts || [];

  // ------------------------------------------------
  // KPI Cards
  // ------------------------------------------------

  const metricCards = [
    {
      title: "Total Revenue",
      value: formatCompactCurrency(kpis.revenue),
      change: "Live",
      positive: true,
      icon: IndianRupee,
    },

    {
      title: "Units Sold",
      value: Number(kpis.unitsSold || 0).toLocaleString("en-IN"),
      change: "Live",
      positive: true,
      icon: TrendingUp,
    },

    {
      title: "Inventory Units",
      value: Number(kpis.inventoryUnits || 0).toLocaleString("en-IN"),
      change: "Live",
      positive: true,
      icon: Package,
    },

    {
      title: "Inventory Turnover",
      value: `${Number(kpis.inventoryTurnover || 0).toFixed(2)}x`,
      change: "Live",
      positive: true,
      icon: TrendingUp,
    },
  ];

  // ------------------------------------------------
  // UI
  // ------------------------------------------------

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* ------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------ */}

      <div className="mb-5 border-b border-[#dfe3e8] pb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#8991a0]">
          Business intelligence
        </p>

        <h1 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-[#172033]">
          Analytics
        </h1>

        <p className="mt-1 text-[12px] text-[#7b8492]">
          Analyze sales, inventory and product performance.
        </p>
      </div>

      {/* ------------------------------------------ */}
      {/* KPI Cards */}
      {/* ------------------------------------------ */}

      <div className="grid grid-cols-1 gap-px border border-[#dfe3e8] bg-[#dfe3e8] sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((item) => (
          <MetricCard key={item.title} {...item} />
        ))}
      </div>

      {/* ------------------------------------------ */}
      {/* Sales & Inventory */}
      {/* ------------------------------------------ */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Sales Performance */}

        <div className="border border-[#dfe3e8] bg-white">
          <div className="border-b border-[#e3e6eb] px-5 py-4">
            <h2 className="text-[13px] font-semibold text-[#172033]">
              Sales Performance
            </h2>

            <p className="mt-0.5 text-[11px] text-[#8991a0]">
              Revenue trend from PostgreSQL data
            </p>
          </div>

          <div className="p-5">
            <SalesPerformanceChart data={salesPerformance} />
          </div>
        </div>

        {/* Inventory Performance */}

        <div className="border border-[#dfe3e8] bg-white">
          <div className="border-b border-[#e3e6eb] px-5 py-4">
            <h2 className="text-[13px] font-semibold text-[#172033]">
              Inventory Performance
            </h2>

            <p className="mt-0.5 text-[11px] text-[#8991a0]">
              Inventory levels from PostgreSQL data
            </p>
          </div>

          <div className="p-5">
            <InventoryPerformanceChart data={inventoryPerformance} />
          </div>
        </div>
      </div>

      {/* ------------------------------------------ */}
      {/* Product Performance */}
      {/* ------------------------------------------ */}

      <div className="mt-5 border border-[#dfe3e8] bg-white">
        <div className="border-b border-[#e3e6eb] px-5 py-4">
          <h2 className="text-[13px] font-semibold text-[#172033]">
            Product Performance
          </h2>

          <p className="mt-0.5 text-[11px] text-[#8991a0]">
            Revenue generated by top products
          </p>
        </div>

        <div className="p-5">
          <ProductPerformanceChart data={productPerformance} />
        </div>
      </div>

      {/* ------------------------------------------ */}
      {/* Product Lists */}
      {/* ------------------------------------------ */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* ---------------------------------------- */}
        {/* Top Performing Products */}
        {/* ---------------------------------------- */}

        <div className="border border-[#dfe3e8] bg-white">
          <div className="border-b border-[#e3e6eb] px-5 py-4">
            <h2 className="text-[13px] font-semibold text-[#172033]">
              Top Performing Products
            </h2>

            <p className="mt-0.5 text-[11px] text-[#8991a0]">
              Products generating the highest revenue
            </p>
          </div>

          <div className="divide-y divide-[#edf0f3]">
            {topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center justify-between px-5 py-4 hover:bg-[#fafbfc]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center border border-[#e3e6eb] bg-[#fafbfc] text-[10px] font-semibold text-[#596273]">
                    {index + 1}
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-[#172033]">
                      {product.name}
                    </p>

                    <p className="mt-1 text-[10px] text-[#8991a0]">
                      {Number(product.units || 0).toLocaleString("en-IN")} units
                      sold
                    </p>
                  </div>
                </div>

                <p className="text-[11px] font-semibold text-[#172033]">
                  {formatCompactCurrency(product.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------------------------------- */}
        {/* Slow Moving Products */}
        {/* ---------------------------------------- */}

        <div className="border border-[#dfe3e8] bg-white">
          <div className="border-b border-[#e3e6eb] px-5 py-4">
            <h2 className="text-[13px] font-semibold text-[#172033]">
              Slow-Moving Products
            </h2>

            <p className="mt-0.5 text-[11px] text-[#8991a0]">
              Products with lower sales velocity
            </p>
          </div>

          <div className="divide-y divide-[#edf0f3]">
            {slowProducts.map((product) => (
              <div
                key={product.name}
                className="flex items-center justify-between px-5 py-4 hover:bg-[#fafbfc]"
              >
                <div>
                  <p className="text-[11px] font-semibold text-[#172033]">
                    {product.name}
                  </p>

                  <p className="mt-1 text-[10px] text-[#8991a0]">
                    {Number(product.units || 0).toLocaleString("en-IN")} units
                    sold
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] font-semibold text-[#172033]">
                    {Number(product.stock || 0).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-1 text-[10px] text-[#8991a0]">
                    units in stock
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
