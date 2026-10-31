import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  Boxes,
  Check,
  CheckCircle,
  Loader2,
  PackageX,
  Search,
  TrendingUp,
} from "lucide-react";

import { getAlerts, resolveAlert } from "../api/alertsApi";

function SeverityBadge({ severity }) {
  const styles = {
    Critical: "bg-red-100 text-red-700",
    High: "bg-orange-100 text-orange-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[severity] || "bg-gray-100 text-gray-700"
      }`}
    >
      {severity}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        status === "Resolved"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvingId, setResolvingId] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // ==========================================
  // LOAD ALERTS
  // ==========================================

  async function loadAlerts() {
    try {
      setError("");

      const result = await getAlerts();

      if (!result.success) {
        throw new Error(result.message || "Failed to load alerts");
      }

      setAlerts(result.data || []);
    } catch (err) {
      console.error("Alerts fetch error:", err);

      setError(err.message || "Unable to load alerts.");
    }
  }

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    async function initializeAlerts() {
      try {
        setLoading(true);
        await loadAlerts();
      } finally {
        setLoading(false);
      }
    }

    initializeAlerts();
  }, []);

  // ==========================================
  // ALERT TYPES
  // ==========================================

  const types = useMemo(() => {
    return ["All", ...new Set(alerts.map((alert) => alert.type))];
  }, [alerts]);

  // ==========================================
  // FILTER ALERTS
  // ==========================================

  const filteredAlerts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return alerts.filter((alert) => {
      const matchesSearch =
        String(alert.product || "")
          .toLowerCase()
          .includes(query) ||
        String(alert.sku || "")
          .toLowerCase()
          .includes(query) ||
        String(alert.message || "")
          .toLowerCase()
          .includes(query);

      const matchesType = typeFilter === "All" || alert.type === typeFilter;

      const matchesSeverity =
        severityFilter === "All" || alert.severity === severityFilter;

      const matchesStatus =
        statusFilter === "All" || alert.status === statusFilter;

      return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    });
  }, [alerts, search, typeFilter, severityFilter, statusFilter]);

  // ==========================================
  // RESOLVE ALERT
  // ==========================================

  async function handleResolve(id) {
    try {
      setError("");
      setResolvingId(id);

      // Save resolved status in PostgreSQL
      await resolveAlert(id);

      // Reload alerts from PostgreSQL
      // so UI always reflects the database
      await loadAlerts();
    } catch (err) {
      console.error("Resolve alert error:", err);

      setError(err.message || "Failed to resolve alert.");
    } finally {
      setResolvingId(null);
    }
  }

  // ==========================================
  // SUMMARY
  // ==========================================

  const openAlerts = alerts.filter((alert) => alert.status === "Open").length;

  const criticalAlerts = alerts.filter(
    (alert) => alert.status === "Open" && alert.severity === "Critical",
  ).length;

  const lowStockAlerts = alerts.filter(
    (alert) =>
      alert.status === "Open" &&
      (alert.type === "Low Stock" ||
        alert.type === "Critical Stock" ||
        alert.type === "Out of Stock"),
  ).length;

  const resolvedAlerts = alerts.filter(
    (alert) => alert.status === "Resolved",
  ).length;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2 size={25} className="mx-auto animate-spin text-[#315efb]" />

          <p className="mt-3 text-sm font-medium text-[#4f5968]">
            Loading alerts
          </p>

          <p className="mt-1 text-xs text-[#8991a0]">
            Fetching live data from PostgreSQL...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && alerts.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1f1]">
            <AlertTriangle size={20} className="text-[#c24141]" />
          </div>

          <h2 className="mt-4 text-sm font-semibold text-[#172033]">
            Unable to load alerts
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

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Alerts</h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor inventory and sales alerts that require attention.
        </p>
      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* OPEN */}

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Open Alerts</p>

            <AlertTriangle size={20} className="text-orange-500" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {openAlerts}
          </p>
        </div>

        {/* CRITICAL */}

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Critical Alerts</p>

            <PackageX size={20} className="text-red-500" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {criticalAlerts}
          </p>
        </div>

        {/* STOCK */}

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Stock Alerts</p>

            <Boxes size={20} className="text-blue-500" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {lowStockAlerts}
          </p>
        </div>

        {/* RESOLVED */}

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Resolved</p>

            <CheckCircle size={20} className="text-green-500" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {resolvedAlerts}
          </p>
        </div>
      </div>

      {/* FILTERS */}

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 xl:flex-row">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, SKU or alert..."
              className="h-10 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* TYPE */}

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
          >
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          {/* SEVERITY */}

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
          >
            <option>All</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
          >
            <option>All</option>
            <option>Open</option>
            <option>Resolved</option>
          </select>
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Inventory & Sales Alerts
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {filteredAlerts.length} alerts found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Alert
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Product
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Store
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Severity
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Message
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Date
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  {/* ALERT */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {alert.type === "Out of Stock" ||
                      alert.type === "Critical Stock" ? (
                        <PackageX size={17} className="text-red-500" />
                      ) : alert.type === "Demand Increase" ||
                        alert.type === "Unusual Sales" ? (
                        <TrendingUp size={17} className="text-blue-500" />
                      ) : (
                        <AlertTriangle size={17} className="text-orange-500" />
                      )}

                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {alert.type}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {alert.sku}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* PRODUCT */}

                  <td className="px-5 py-4 text-sm font-medium text-gray-900">
                    {alert.product}
                  </td>

                  {/* STORE */}

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {alert.store || "-"}
                  </td>

                  {/* SEVERITY */}

                  <td className="px-5 py-4">
                    <SeverityBadge severity={alert.severity} />
                  </td>

                  {/* MESSAGE */}

                  <td className="max-w-[320px] px-5 py-4 text-sm text-gray-600">
                    {alert.message}
                  </td>

                  {/* DATE */}

                  <td className="px-5 py-4 text-sm text-gray-500">
                    {alert.date}
                  </td>

                  {/* STATUS */}

                  <td className="px-5 py-4">
                    <StatusBadge status={alert.status} />
                  </td>

                  {/* ACTION */}

                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      {alert.status === "Open" ? (
                        <button
                          type="button"
                          onClick={() => handleResolve(alert.id)}
                          disabled={resolvingId === alert.id}
                          className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {resolvingId === alert.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Resolving...
                            </>
                          ) : (
                            <>
                              <Check size={14} />
                              Resolve
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Resolved</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EMPTY */}

        {filteredAlerts.length === 0 && (
          <div className="p-10 text-center">
            <CheckCircle size={28} className="mx-auto text-green-500" />

            <p className="mt-3 text-sm font-medium text-gray-700">
              No alerts found
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Try changing your filters or search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
