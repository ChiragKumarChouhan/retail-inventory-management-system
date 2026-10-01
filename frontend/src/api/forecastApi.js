const API_URL = "http://localhost:5000/api";

export async function getForecast({ productId = "", period = 7 } = {}) {
  const params = new URLSearchParams();

  if (productId) {
    params.set("productId", productId);
  }

  params.set("period", period);

  const response = await fetch(`${API_URL}/forecast?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch forecast data");
  }

  return response.json();
}
