const API_URL = "http://localhost:5000/api";

export async function getSales({ category = "All", dateRange = "All" } = {}) {
  const params = new URLSearchParams();

  if (category && category !== "All") {
    params.set("category", category);
  }

  if (dateRange && dateRange !== "All") {
    params.set("dateRange", dateRange);
  }

  const query = params.toString();

  const response = await fetch(`${API_URL}/sales${query ? `?${query}` : ""}`);

  if (!response.ok) {
    throw new Error("Failed to fetch sales");
  }

  return response.json();
}
