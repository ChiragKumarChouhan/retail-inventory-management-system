import { X } from "lucide-react";
import { useEffect, useState } from "react";

const initialForm = {
  name: "",
  sku: "",
  category: "Electronics",
  supplier: "",
  price: "",
  stock: "",
  reorderLevel: "",
};

const categories = [
  "Electronics",
  "Grocery",
  "Home Appliances",
  "Personal Care",
  "Office Supplies",
  "Accessories",
];

export default function ProductModal({ isOpen, onClose, onSave, product }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        category: product.category,
        supplier: product.supplier,
        price: product.price,
        stock: product.stock,
        reorderLevel: product.reorderLevel,
      });
    } else {
      setForm(initialForm);
    }
  }, [product, isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (
      !form.name ||
      !form.sku ||
      !form.supplier ||
      !form.price ||
      !form.stock ||
      !form.reorderLevel
    ) {
      return;
    }

    onSave({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      reorderLevel: Number(form.reorderLevel),
    });

    setForm(initialForm);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {product ? "Edit Product" : "Add Product"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {product
                ? "Update product information."
                : "Add a new product to your inventory."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Product Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                SKU
              </label>

              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="SKU-001"
                className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Supplier */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Supplier
              </label>

              <input
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                placeholder="Supplier name"
                className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Price
              </label>

              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="₹ 0"
                className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Current Stock
              </label>

              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Reorder Level */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Reorder Level
              </label>

              <input
                name="reorderLevel"
                type="number"
                min="0"
                value={form.reorderLevel}
                onChange={handleChange}
                placeholder="0"
                className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {product ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
