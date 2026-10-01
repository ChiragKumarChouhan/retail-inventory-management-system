const API_URL = "http://localhost:5000/api";

/*
  GET — Fetch products
*/
export async function getProducts({ search = "", category = "All" } = {}) {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (category && category !== "All") {
    params.set("category", category);
  }

  const query = params.toString();

  const response = await fetch(
    `${API_URL}/products${query ? `?${query}` : ""}`,
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch products");
  }

  return result;
}

/*
  POST — Create product
*/
export async function createProduct(productData) {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productData.sku,
      name: productData.name,
      category: productData.category,
      supplier: productData.supplier,
      price: Number(productData.price),
      stock: Number(productData.stock),
      reorderLevel: Number(productData.reorderLevel),
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create product");
  }

  return result;
}

/*
  PUT — Update product
*/
export async function updateProduct(productId, productData) {
  const response = await fetch(
    `${API_URL}/products/${encodeURIComponent(productId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: productData.name,
        category: productData.category,
        supplier: productData.supplier,
        price: Number(productData.price),
        stock: Number(productData.stock),
        reorderLevel: Number(productData.reorderLevel),
      }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update product");
  }

  return result;
}

/*
  DELETE — Delete product
*/
export async function deleteProduct(productId) {
  const response = await fetch(
    `${API_URL}/products/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete product");
  }

  return result;
}
