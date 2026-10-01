const API_URL = "http://localhost:5000/api";

export async function getDashboard(period = 7, signal) {
  const response = await fetch(`${API_URL}/dashboard?period=${period}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
}
