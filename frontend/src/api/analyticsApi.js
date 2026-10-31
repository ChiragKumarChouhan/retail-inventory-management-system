const API_URL = "http://localhost:5000/api";

export async function getAnalytics() {
  const response = await fetch(`${API_URL}/analytics`);

  if (!response.ok) {
    throw new Error("Failed to fetch analytics data");
  }

  return response.json();
}
