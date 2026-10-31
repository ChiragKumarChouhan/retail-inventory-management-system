import { useEffect, useState } from "react";

import {
  AlertTriangle,
  Boxes,
  ChevronRight,
  IndianRupee,
  Loader2,
  ShoppingCart,
  TrendingUp,
  Package,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Link } from "react-router-dom";

import { getDashboard } from "../services/dashboardApi";

// --------------------------------------------------
// Formatting
// --------------------------------------------------

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatCompactCurrency = (value) => {
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
};

// --------------------------------------------------
// KPI Card
// --------------------------------------------------

function Kpi({ label, value, icon: Icon }) {
  return (
    <div className="bg-white px-5 py-4 transition-colors hover:bg-[#fcfcfd]">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8991a0]">
            {label}
          </p>

          <p className="mt-2 truncate text-[22px] font-semibold tracking-[-0.02em] text-[#172033]">
            {value}
          </p>
        </div>

        <div className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#e3e6eb] bg-[#fafbfc] text-[#596273]">
          <Icon size={16} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------
// Section Header
// --------------------------------------------------

function SectionHeader({ title, description, action }) {
  return (
    <div className="flex min-h-[68px] items-center justify-between gap-4 border-b border-[#e3e6eb] px-5 py-3.5">
      <div className="min-w-0">
        <h2 className="truncate text-[13px] font-semibold text-[#172033]">
          {title}
        </h2>

        {description && (
          <p className="mt-0.5 truncate text-[11px] text-[#8991a0]">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// --------------------------------------------------
// Status Badge
// --------------------------------------------------

function Status({ status }) {
  const critical = status === "Critical";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-medium ${
        critical
          ? "border-[#f1cccc] bg-[#fff7f7] text-[#c24141]"
          : "border-[#ead8b7] bg-[#fffbf3] text-[#a56a16]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          critical ? "bg-[#c24141]" : "bg-[#b7791f]"
        }`}
      />

      {status}
    </span>
  );
}

// --------------------------------------------------
// Stock Indicator
// --------------------------------------------------

function StockValue({ stock }) {
  const value = Number(stock || 0);

  if (value === 0) {
    return <span className="font-semibold text-[#c24141]">0</span>;
  }

  return (
    <span className="font-semibold text-[#172033]">
      {value.toLocaleString("en-IN")}
    </span>
  );
}

// --------------------------------------------------
// Dashboard
// --------------------------------------------------

export default function Dashboard() {
  const [period, setPeriod] = useState(7);

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // Load Dashboard
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const result = await getDashboard(period);

        if (cancelled) return;

        if (!result.success) {
          throw new Error(result.message || "Failed to load dashboard");
        }

        setDashboard(result);
      } catch (err) {
        if (cancelled) return;

        console.error("Dashboard fetch error:", err);

        setError(err.message || "Unable to load dashboard data.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [period]);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

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
              Loading dashboard
            </p>

            <p className="mt-1 text-xs text-[#8991a0]">
              Fetching live data from PostgreSQL...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div className="mx-auto max-w-[1600px]">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1f1]">
              <AlertTriangle size={20} className="text-[#c24141]" />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[#172033]">
              Unable to load dashboard
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

  // --------------------------------------------------
  // API Data
  // --------------------------------------------------

  const kpis = dashboard?.kpis || {};

  const salesData = dashboard?.salesData || [];

  const categoryData = dashboard?.categoryData || [];

  const inventoryStatus = dashboard?.inventoryStatus || [];

  const topProducts = dashboard?.topProducts || [];

  const lowStock = dashboard?.lowStock || [];

  const healthyPercentage =
    inventoryStatus.find((item) => item.name === "Healthy")?.value || 0;

  // --------------------------------------------------
  // Export
  // --------------------------------------------------

  const handleExport = () => {
    const rows = [];

    rows.push(["DASHBOARD SUMMARY"]);
    rows.push(["Period", `${period} Days`]);
    rows.push(["Revenue", kpis.revenue || 0]);
    rows.push(["Units Sold", kpis.unitsSold || 0]);
    rows.push(["Inventory Units", kpis.inventoryUnits || 0]);
    rows.push(["Low Stock Items", kpis.lowStockItems || 0]);

    rows.push([]);

    rows.push(["SALES PERFORMANCE"]);
    rows.push(["Date", "Revenue"]);

    salesData.forEach((item) => {
      rows.push([item.day || "", item.sales || 0]);
    });

    rows.push([]);

    rows.push(["CATEGORY PERFORMANCE"]);
    rows.push(["Category", "Revenue"]);

    categoryData.forEach((item) => {
      rows.push([item.name || "", item.value || 0]);
    });

    rows.push([]);

    rows.push(["TOP SELLING PRODUCTS"]);

    rows.push(["Product", "Category", "Units", "Revenue"]);

    topProducts.forEach((product) => {
      rows.push([
        product.name || "",
        product.category || "",
        product.units || 0,
        product.value || 0,
      ]);
    });

    rows.push([]);

    rows.push(["LOW STOCK PRODUCTS"]);

    rows.push(["Product", "SKU", "Stock", "Reorder", "Status"]);

    lowStock.forEach((product) => {
      rows.push([
        product.name || "",
        product.sku || "",
        product.stock || 0,
        product.reorder || 0,
        product.status || "",
      ]);
    });

    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");

            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `retail-dashboard-${period}-days.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* --------------------------------------------------
          Page Toolbar
      -------------------------------------------------- */}

      <div className="mb-5 flex flex-col justify-between gap-3 border-b border-[#dfe3e8] pb-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8991a0]">
            Operations overview
          </p>

          <h1 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-[#172033]">
            Retail performance
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="h-9 rounded-md border border-[#dfe3e8] bg-white px-3 text-[11px] text-[#596273] outline-none transition-colors focus:border-[#315efb]"
          >
            <option value={7}>Last 7 days</option>

            <option value={30}>Last 30 days</option>

            <option value={90}>Last 90 days</option>
          </select>

          <button
            type="button"
            onClick={handleExport}
            className="h-9 rounded-md border border-[#dfe3e8] bg-white px-3 text-[11px] font-medium text-[#596273] transition-colors hover:bg-[#f7f8fa]"
          >
            Export
          </button>
        </div>
      </div>

      {/* --------------------------------------------------
          KPI Row
      -------------------------------------------------- */}

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-[#dfe3e8] bg-[#dfe3e8] sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Revenue"
          value={formatCurrency(kpis.revenue)}
          icon={IndianRupee}
        />

        <Kpi
          label="Units Sold"
          value={Number(kpis.unitsSold || 0).toLocaleString("en-IN")}
          icon={ShoppingCart}
        />

        <Kpi
          label="Inventory Units"
          value={Number(kpis.inventoryUnits || 0).toLocaleString("en-IN")}
          icon={Boxes}
        />

        <Kpi
          label="Low Stock Items"
          value={Number(kpis.lowStockItems || 0).toLocaleString("en-IN")}
          icon={AlertTriangle}
        />
      </div>

      {/* --------------------------------------------------
          Sales + Inventory Status
      -------------------------------------------------- */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
        {/* Sales Performance */}

        <section className="overflow-hidden rounded-md border border-[#dfe3e8] bg-white">
          <SectionHeader
            title="Sales performance"
            description={`Daily revenue across the last ${period} days`}
            action={
              <span className="text-[11px] font-semibold text-[#315efb]">
                {formatCompactCurrency(kpis.revenue)} total
              </span>
            }
          />

          <div className="h-[310px] px-3 pb-4 pt-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid
                  stroke="#edf0f3"
                  vertical={false}
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="day"
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
                  contentStyle={{
                    border: "1px solid #dfe3e8",
                    borderRadius: 6,
                    boxShadow: "0 6px 18px rgba(23,32,51,.08)",
                    fontSize: 11,
                  }}
                  formatter={(value) => [formatCurrency(value), "Revenue"]}
                />

                <Line
                  type="monotone"
                  dataKey="sales"
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
        </section>

        {/* Inventory Status */}

        <section className="overflow-hidden rounded-md border border-[#dfe3e8] bg-white">
          <SectionHeader
            title="Inventory status"
            description="Current stock health"
          />

          <div className="flex h-[310px] flex-col">
            <div className="flex flex-1 items-center justify-center">
              <div className="relative h-[185px] w-[185px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryStatus}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={61}
                      outerRadius={81}
                      paddingAngle={2}
                      stroke="none"
                    >
                      <Cell fill="#315efb" />
                      <Cell fill="#b7791f" />
                      <Cell fill="#c24141" />
                      <Cell fill="#8991a0" />
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[24px] font-semibold text-[#172033]">
                    {healthyPercentage}%
                  </span>

                  <span className="text-[10px] text-[#8991a0]">healthy</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 border-t border-[#edf0f3]">
              {inventoryStatus.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 border-b border-r border-[#edf0f3] px-4 py-2.5 last:border-r-0"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background: ["#315efb", "#b7791f", "#c24141", "#8991a0"][
                        index
                      ],
                    }}
                  />

                  <span className="text-[10px] text-[#697386]">
                    {item.name}
                  </span>

                  <span className="ml-auto text-[10px] font-semibold tabular-nums text-[#172033]">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* --------------------------------------------------
          Category Performance
      -------------------------------------------------- */}

      <section className="mt-5 overflow-hidden rounded-md border border-[#dfe3e8] bg-white">
        <SectionHeader
          title="Category performance"
          description="Revenue contribution by category"
        />

        <div className="h-[280px] px-3 pb-4 pt-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
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
                  borderRadius: 6,
                  fontSize: 11,
                }}
              />

              <Bar
                dataKey="value"
                fill="#315efb"
                radius={[3, 3, 0, 0]}
                barSize={38}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* --------------------------------------------------
          Bottom Tables
      -------------------------------------------------- */}

      <div className="mt-5 grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
        {/* ==================================================
            TOP SELLING PRODUCTS
        ================================================== */}

        <section className="flex min-w-0 flex-col overflow-hidden rounded-md border border-[#dfe3e8] bg-white">
          <SectionHeader
            title="Top selling products"
            description="Highest unit volume"
            action={
              <Link
                to="/products"
                className="flex items-center gap-1 text-[11px] font-medium text-[#315efb] hover:text-[#244bd5]"
              >
                View products
                <ChevronRight size={13} />
              </Link>
            }
          />

          <div className="flex-1">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-[#e3e6eb] bg-[#fafbfc]">
                  <th className="w-[42%] px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7b8492]">
                    Product
                  </th>

                  <th className="w-[28%] px-3 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7b8492]">
                    Category
                  </th>

                  <th className="w-[15%] px-3 py-3 text-right text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7b8492]">
                    Units
                  </th>

                  <th className="w-[15%] px-5 py-3 text-right text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7b8492]">
                    Revenue
                  </th>
                </tr>
              </thead>

              <tbody>
                {topProducts.length > 0 ? (
                  topProducts.slice(0, 5).map((product) => (
                    <tr
                      key={product.name}
                      className="group border-b border-[#edf0f3] last:border-0 hover:bg-[#fafbfc]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#f1f4ff] text-[#315efb]">
                            <Package size={14} strokeWidth={1.8} />
                          </div>

                          <p className="truncate text-[11px] font-semibold text-[#172033]">
                            {product.name}
                          </p>
                        </div>
                      </td>

                      <td className="truncate px-3 py-3.5 text-[11px] text-[#697386]">
                        {product.category}
                      </td>

                      <td className="px-3 py-3.5 text-right text-[11px] font-semibold tabular-nums text-[#172033]">
                        {Number(product.units || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-3.5 text-right text-[11px] font-semibold tabular-nums text-[#172033]">
                        {formatCurrency(product.value)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-xs text-[#8991a0]"
                    >
                      No product data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {topProducts.length > 5 && (
            <div className="border-t border-[#edf0f3] px-5 py-2.5">
              <Link
                to="/products"
                className="text-[10px] font-medium text-[#315efb]"
              >
                View all {topProducts.length} products →
              </Link>
            </div>
          )}
        </section>

        {/* ==================================================
            LOW STOCK
        ================================================== */}

        <section className="flex min-w-0 flex-col overflow-hidden rounded-md border border-[#dfe3e8] bg-white">
          <SectionHeader
            title="Low stock"
            description="Products requiring replenishment"
            action={
              <Link
                to="/inventory"
                className="flex items-center gap-1 text-[11px] font-medium text-[#315efb] hover:text-[#244bd5]"
              >
                Inventory
                <ChevronRight size={13} />
              </Link>
            }
          />

          <div className="flex-1">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-[#e3e6eb] bg-[#fafbfc]">
                  <th className="w-[40%] px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7b8492]">
                    Product
                  </th>

                  <th className="w-[18%] px-3 py-3 text-right text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7b8492]">
                    Stock
                  </th>

                  <th className="w-[18%] px-3 py-3 text-right text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7b8492]">
                    Reorder
                  </th>

                  <th className="w-[24%] px-5 py-3 text-right text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7b8492]">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {lowStock.length > 0 ? (
                  lowStock.slice(0, 5).map((product) => (
                    <tr
                      key={product.sku}
                      className="border-b border-[#edf0f3] last:border-0 hover:bg-[#fafbfc]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-semibold text-[#172033]">
                            {product.name}
                          </p>

                          <p className="mt-0.5 truncate font-mono text-[9px] text-[#9299a5]">
                            {product.sku}
                          </p>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 text-right text-[11px] tabular-nums">
                        <StockValue stock={product.stock} />
                      </td>

                      <td className="px-3 py-3.5 text-right text-[11px] tabular-nums text-[#697386]">
                        {Number(product.reorder || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Status status={product.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f8f4] text-[#23834b]">
                          <Package size={15} />
                        </div>

                        <p className="mt-2 text-xs font-medium text-[#4f5968]">
                          No low stock items
                        </p>

                        <p className="mt-0.5 text-[10px] text-[#9299a5]">
                          Inventory levels are healthy.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {lowStock.length > 5 && (
            <div className="border-t border-[#edf0f3] px-5 py-2.5">
              <Link
                to="/inventory"
                className="text-[10px] font-medium text-[#315efb]"
              >
                View all {lowStock.length} low-stock items →
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
