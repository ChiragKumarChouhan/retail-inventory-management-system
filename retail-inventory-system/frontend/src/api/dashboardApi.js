const API_URL = "http://localhost:5000/api";

export async function getDashboard(period = 7) {
  const response = await fetch(`${API_URL}/dashboard?period=${period}`);

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
}
