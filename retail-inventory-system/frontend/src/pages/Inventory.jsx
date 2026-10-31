import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Search,
} from "lucide-react";

import { getInventory } from "../api/inventoryApi";
import StatusBadge from "../components/StatusBadge";

function getStatus(stock, demand) {
  if (stock === 0) {
    return "Out of Stock";
  }

  if (demand > 0 && stock <= demand * 0.5) {
    return "Critical";
  }

  if (demand > 0 && stock <= demand) {
    return "Low Stock";
  }

  return "In Stock";
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Inventory() {
  const [inventory, setInventory] = useState([]);

  // Dynamic filter options from PostgreSQL
  const [inventoryOptions, setInventoryOptions] = useState({
    categories: [],
    stores: [],
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search input
  const [search, setSearch] = useState("");

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Server-side filters
  const [category, setCategory] = useState("All");
  const [storeId, setStoreId] = useState("All");

  // Client-side status filter
  const [status, setStatus] = useState("All");

  // Sorting
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  // Loading / error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Debounce search
  // --------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // --------------------------------------------------
  // Fetch real PostgreSQL data
  // --------------------------------------------------

  useEffect(() => {
    async function loadInventory() {
      try {
        setLoading(true);
        setError("");

        const result = await getInventory({
          page,
          limit,
          search: debouncedSearch,
          category,
          storeId,
        });

        if (!result.success) {
          throw new Error("Failed to fetch inventory data");
        }

        setInventory(result.data || []);

        setTotal(result.pagination?.total || 0);

        setTotalPages(result.pagination?.totalPages || 1);

        // Get categories and stores directly from PostgreSQL
        setInventoryOptions({
          categories: result.options?.categories || [],
          stores: result.options?.stores || [],
        });
      } catch (err) {
        console.error("Inventory fetch error:", err);

        setError(
          err.message || "Unable to load inventory data from the server.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadInventory();
  }, [page, limit, debouncedSearch, category, storeId]);

  // --------------------------------------------------
  // Dynamic Categories and Stores
  // --------------------------------------------------

  const categories = useMemo(() => {
    return [
      "All",
      ...(inventoryOptions.categories || []).filter(
        (item) => item && item !== "All",
      ),
    ];
  }, [inventoryOptions.categories]);

  const stores = useMemo(() => {
    return [
      "All",
      ...(inventoryOptions.stores || []).filter(
        (item) => item && item !== "All",
      ),
    ];
  }, [inventoryOptions.stores]);

  // --------------------------------------------------
  // Transform database records for UI
  // --------------------------------------------------

  const formattedInventory = useMemo(() => {
    return inventory.map((item) => {
      const stock = Number(item.inventory_level || 0);
      const demand = Number(item.demand || 0);
      const price = Number(item.price || 0);

      return {
        ...item,
        stock,
        demand,
        price,
        status: getStatus(stock, demand),
        stockValue: stock * price,
      };
    });
  }, [inventory]);

  // --------------------------------------------------
  // Status filter + sorting
  // --------------------------------------------------

  const filteredInventory = useMemo(() => {
    let result = [...formattedInventory];

    // Status is calculated in React because
    // it is not a database column.
    if (status !== "All") {
      result = result.filter((item) => item.status === status);
    }

    // Sorting applies to the currently loaded page.
    if (sortField) {
      result.sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];

        if (typeof valueA === "string") {
          valueA = valueA.toLowerCase();
          valueB = String(valueB || "").toLowerCase();
        }

        if (valueA < valueB) {
          return sortDirection === "asc" ? -1 : 1;
        }

        if (valueA > valueB) {
          return sortDirection === "asc" ? 1 : -1;
        }

        return 0;
      });
    }

    return result;
  }, [formattedInventory, status, sortField, sortDirection]);

  // --------------------------------------------------
  // Sorting
  // --------------------------------------------------

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  function goToPage(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // --------------------------------------------------
  // Export current page
  // --------------------------------------------------

  function handleExport() {
    if (!filteredInventory.length) {
      return;
    }

    const headers = [
      "Record ID",
      "Date",
      "Store ID",
      "Product ID",
      "Category",
      "Inventory Level",
      "Units Sold",
      "Units Ordered",
      "Price",
      "Discount",
      "Weather",
      "Promotion",
      "Competitor Price",
      "Seasonality",
      "Epidemic",
      "Demand",
      "Stock Value",
      "Status",
    ];

    const rows = filteredInventory.map((item) => [
      item.record_id,
      formatDate(item.date),
      item.store_id,
      item.product_id,
      item.category,
      item.inventory_level,
      item.units_sold,
      item.units_ordered,
      item.price,
      item.discount,
      item.weather_condition,
      item.promotion,
      item.competitor_pricing,
      item.seasonality,
      item.epidemic,
      item.demand,
      item.stockValue,
      item.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `inventory-page-${page}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="rims-page-title">Inventory</h1>

          <p className="rims-page-description">
            Monitor stock levels, inventory value and demand across stores.
          </p>
        </div>

        <div className="rims-surface flex min-h-[420px] items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 size={24} className="animate-spin text-[#315efb]" />

            <p className="mt-3 text-sm font-medium text-[#4f5968]">
              Loading inventory
            </p>

            <p className="mt-1 text-xs text-[#8991a0]">
              Fetching records from PostgreSQL...
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
      <div className="space-y-6">
        <div>
          <h1 className="rims-page-title">Inventory</h1>

          <p className="rims-page-description">
            Monitor stock levels, inventory value and demand across stores.
          </p>
        </div>

        <div className="rims-surface flex min-h-[320px] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1f1]">
              <AlertCircle size={20} className="text-[#c24141]" />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[#172033]">
              Unable to load inventory
            </h2>

            <p className="mt-2 text-xs leading-5 text-[#7b8492]">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 h-9 rounded-md border border-[#dfe3e8] bg-white px-4 text-xs font-medium text-[#3f4958] hover:bg-[#f7f8fa]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <div className="space-y-5">
      {/* Page heading */}

      <div className="flex flex-col justify-between gap-4 border-b border-[#e3e6eb] pb-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8991a0]">
            Operations
          </div>

          <h1 className="rims-page-title">Inventory</h1>

          <p className="rims-page-description">
            Monitor stock levels, inventory value and demand across stores.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#d9dde4] bg-white px-3.5 text-xs font-medium text-[#4f5968] transition hover:bg-[#f7f8fa]"
        >
          <Download size={15} strokeWidth={1.8} />
          Export
        </button>
      </div>

      {/* Summary strip */}

      <div className="grid grid-cols-2 border border-[#dfe3e8] bg-white lg:grid-cols-4">
        <div className="border-b border-[#e3e6eb] px-4 py-4 lg:border-b-0 lg:border-r">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8991a0]">
            Records
          </p>

          <p className="mt-1.5 text-xl font-semibold tracking-tight text-[#172033]">
            {total.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="border-b border-[#e3e6eb] px-4 py-4 lg:border-b-0 lg:border-r">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8991a0]">
            Current Page
          </p>

          <p className="mt-1.5 text-xl font-semibold tracking-tight text-[#172033]">
            {inventory.length}
          </p>
        </div>

        <div className="border-r border-[#e3e6eb] px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8991a0]">
            Units in View
          </p>

          <p className="mt-1.5 text-xl font-semibold tracking-tight text-[#172033]">
            {inventory
              .reduce((sum, item) => sum + Number(item.inventory_level || 0), 0)
              .toLocaleString("en-IN")}
          </p>
        </div>

        <div className="px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8991a0]">
            Inventory Value
          </p>

          <p className="mt-1.5 text-xl font-semibold tracking-tight text-[#172033]">
            {formatCurrency(
              inventory.reduce(
                (sum, item) =>
                  sum +
                  Number(item.inventory_level || 0) * Number(item.price || 0),
                0,
              ),
            )}
          </p>
        </div>
      </div>

      {/* Filters */}

      <div className="border border-[#dfe3e8] bg-white">
        <div className="flex flex-col gap-3 p-3 lg:flex-row">
          {/* Search */}

          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search
              size={15}
              strokeWidth={1.8}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8991a0]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search product, store or category"
              className="h-9 w-full rounded-md border border-[#dfe3e8] bg-white pl-9 pr-3 text-xs text-[#172033] placeholder:text-[#9aa1ad] focus:border-[#315efb]"
            />
          </div>

          {/* Category */}

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-[#dfe3e8] bg-white px-3 text-xs text-[#4f5968] focus:border-[#315efb]"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All categories" : item}
              </option>
            ))}
          </select>

          {/* Store */}

          <select
            value={storeId}
            onChange={(e) => {
              setStoreId(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-[#dfe3e8] bg-white px-3 text-xs text-[#4f5968] focus:border-[#315efb]"
          >
            {stores.map((store) => (
              <option key={store} value={store}>
                {store === "All" ? "All stores" : store}
              </option>
            ))}
          </select>

          {/* Status */}

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-[#dfe3e8] bg-white px-3 text-xs text-[#4f5968] focus:border-[#315efb]"
          >
            <option value="All">All status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Critical">Critical</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          {/* Clear */}

          {(search ||
            category !== "All" ||
            storeId !== "All" ||
            status !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDebouncedSearch("");
                setCategory("All");
                setStoreId("All");
                setStatus("All");
                setPage(1);
              }}
              className="h-9 px-3 text-xs font-medium text-[#315efb] hover:text-[#244bd5]"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}

      <div className="overflow-hidden border border-[#dfe3e8] bg-white">
        <div className="flex flex-col justify-between gap-2 border-b border-[#e3e6eb] px-4 py-3.5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[13px] font-semibold text-[#172033]">
              Inventory Records
            </h2>

            <p className="mt-0.5 text-[11px] text-[#8991a0]">
              Live records from PostgreSQL
            </p>
          </div>

          <div className="text-[11px] text-[#7b8492]">
            Page {page} of {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#dfe3e8] bg-[#f8f9fb]">
                <th className="whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
                  Record
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
                  Date
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
                  Product
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
                  Store
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
                  Category
                </th>

                <th
                  onClick={() => handleSort("stock")}
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386] hover:text-[#315efb]"
                >
                  <span className="inline-flex items-center gap-1">
                    Stock
                    {sortField === "stock" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      ))}
                  </span>
                </th>

                <th
                  onClick={() => handleSort("units_sold")}
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386] hover:text-[#315efb]"
                >
                  <span className="inline-flex items-center gap-1">
                    Sold
                    {sortField === "units_sold" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      ))}
                  </span>
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
                  Ordered
                </th>

                <th
                  onClick={() => handleSort("price")}
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386] hover:text-[#315efb]"
                >
                  <span className="inline-flex items-center gap-1">
                    Price
                    {sortField === "price" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      ))}
                  </span>
                </th>

                <th
                  onClick={() => handleSort("stockValue")}
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386] hover:text-[#315efb]"
                >
                  <span className="inline-flex items-center gap-1">
                    Stock Value
                    {sortField === "stockValue" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      ))}
                  </span>
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#edf0f3]">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr
                    key={item.record_id}
                    className="group transition-colors hover:bg-[#fafbfc]"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-[12px] font-medium text-[#697386]">
                      #{item.record_id}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-[12px] text-[#5f6878]">
                      {formatDate(item.date)}
                    </td>

                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-[12px] font-semibold text-[#172033]">
                          {item.product_id}
                        </p>

                        <p className="mt-0.5 text-[10px] text-[#9299a5]">
                          Demand:{" "}
                          {Number(item.demand || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-[12px] text-[#5f6878]">
                      {item.store_id}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-[12px] text-[#5f6878]">
                      {item.category}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-[12px] font-semibold text-[#172033]">
                      {Number(item.stock).toLocaleString("en-IN")}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-[12px] text-[#4f5968]">
                      {Number(item.units_sold || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-[12px] text-[#4f5968]">
                      {Number(item.units_ordered || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-[12px] text-[#4f5968]">
                      {formatCurrency(item.price)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-[12px] font-semibold text-[#172033]">
                      {formatCurrency(item.stockValue)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="px-6 py-16 text-center">
                    <p className="text-sm font-medium text-[#4f5968]">
                      No inventory records found
                    </p>

                    <p className="mt-1 text-xs text-[#9299a5]">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}

        <div className="flex min-h-[56px] items-center justify-between border-t border-[#e3e6eb] px-4">
          <p className="text-[11px] text-[#7b8492]">
            Showing{" "}
            {total === 0
              ? 0
              : `${(page - 1) * limit + 1}–${Math.min(
                  page * limit,
                  total,
                )}`}{" "}
            of {total.toLocaleString("en-IN")} records
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded border border-[#dfe3e8] bg-white text-[#687282] transition hover:bg-[#f5f6f8] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft size={15} />
            </button>

            <div className="px-2 text-[11px] font-medium text-[#596273]">
              Page {page} / {totalPages}
            </div>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded border border-[#dfe3e8] bg-white text-[#687282] transition hover:bg-[#f5f6f8] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
