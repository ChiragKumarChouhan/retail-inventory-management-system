const API_URL = "http://localhost:5000/api";

export async function getInventory({
  page = 1,
  limit = 25,
  search = "",
  category = "",
  storeId = "",
} = {}) {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (category && category !== "All") {
    params.set("category", category);
  }

  if (storeId && storeId !== "All") {
    params.set("storeId", storeId);
  }

  const response = await fetch(`${API_URL}/inventory?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch inventory");
  }

  return response.json();
}
