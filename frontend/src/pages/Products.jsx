import {
  AlertTriangle,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../api/productsApi";

import ProductModal from "../components/ProductModal";
import StatusBadge from "../components/StatusBadge";

function getStatus(stock, reorderLevel) {
  const currentStock = Number(stock || 0);
  const reorder = Number(reorderLevel || 0);

  if (currentStock === 0) {
    return "Out of Stock";
  }

  if (reorder > 0 && currentStock <= reorder * 0.5) {
    return "Critical";
  }

  if (reorder > 0 && currentStock <= reorder) {
    return "Low Stock";
  }

  return "In Stock";
}

function mapApiProduct(product) {
  return {
    id: product.product_id,
    name: product.name || product.product_id,
    sku: product.product_id,
    category: product.category || "Other",
    supplier: product.supplier || "Unknown",
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    reorderLevel: Number(product.reorderLevel || 0),
    unitsSold: Number(product.units_sold || 0),
    unitsOrdered: Number(product.units_ordered || 0),
    stores: Number(product.stores || 0),

    // Existing inventory products cannot be deleted.
    // Newly created products can be deleted.
    canDelete: product.canDelete === true,
  };
}

export default function Products() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  /*
    Load products from PostgreSQL
  */
  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const result = await getProducts();

      if (!result.success) {
        throw new Error(result.message || "Failed to load products");
      }

      const mappedProducts = (result.data || []).map(mapApiProduct);

      setProducts(mappedProducts);
    } catch (err) {
      console.error("Products fetch error:", err);

      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  /*
    Categories
  */
  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];
  }, [products]);

  /*
    Search + category filter
  */
  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.supplier.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  /*
    Add product
  */
  function handleAddProduct() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  /*
    Edit product
  */
  function handleEditProduct(product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  /*
    Create / Update product in PostgreSQL
  */
  async function handleSaveProduct(productData) {
    try {
      setSaving(true);
      setError("");

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      await loadProducts();

      setModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("Product save error:", err);

      setError(
        err.message ||
          (editingProduct
            ? "Failed to update product."
            : "Failed to create product."),
      );
    } finally {
      setSaving(false);
    }
  }

  /*
    Delete product from PostgreSQL
  */
  async function handleDeleteProduct(productId) {
    const product = products.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    // Safety check on frontend.
    // Existing products linked to inventory cannot be deleted.
    if (!product.canDelete) {
      setError(
        "This product cannot be deleted because it is referenced by inventory records.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${product.name || productId}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteProduct(productId);

      await loadProducts();
    } catch (err) {
      console.error("Product delete error:", err);

      setError(err.message || "Failed to delete product.");
    } finally {
      setSaving(false);
    }
  }

  /*
    Loading state
  */
  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2 size={25} className="mx-auto animate-spin text-blue-600" />

          <p className="mt-3 text-sm font-medium text-gray-700">
            Loading products
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Fetching products from PostgreSQL...
          </p>
        </div>
      </div>
    );
  }

  /*
    Error state
  */
  if (error && products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle size={20} className="text-red-600" />
          </div>

          <h2 className="mt-4 text-sm font-semibold text-gray-900">
            Unable to load products
          </h2>

          <p className="mt-2 text-xs leading-5 text-gray-500">{error}</p>

          <button
            type="button"
            onClick={loadProducts}
            className="mt-4 rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Product Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your retail product catalogue.
          </p>
        </div>

        <button
          onClick={handleAddProduct}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={17} />
          Add Product
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={17} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, SKU or category..."
              className="h-10 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Products</h2>

          <p className="mt-1 text-xs text-gray-500">
            {filteredProducts.length} products found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Product
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  SKU
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Category
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Supplier
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                  Price
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                  Stock
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const status = getStatus(product.stock, product.reorderLevel);

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    {/* Product */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                    </td>

                    {/* SKU */}
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {product.sku}
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {product.category}
                    </td>

                    {/* Supplier */}
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {product.supplier}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 text-right text-sm font-medium text-gray-900">
                      ₹
                      {Number(product.price || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4 text-right text-sm text-gray-700">
                      {Number(product.stock || 0).toLocaleString("en-IN")}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        {/* Edit */}
                        <button
                          onClick={() => handleEditProduct(product)}
                          disabled={saving}
                          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-50"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={saving || !product.canDelete}
                          className={`rounded-md p-2 ${
                            product.canDelete
                              ? "text-gray-500 hover:bg-red-50 hover:text-red-600"
                              : "cursor-not-allowed text-gray-300"
                          } disabled:opacity-50`}
                          title={
                            product.canDelete
                              ? "Delete"
                              : "Cannot delete: product is used in inventory records"
                          }
                        >
                          {product.canDelete ? (
                            <Trash2 size={16} />
                          ) : (
                            <Lock size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-gray-700">
              No products found
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Try changing your search or category filter.
            </p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
            setEditingProduct(null);
          }
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </div>
  );
}
