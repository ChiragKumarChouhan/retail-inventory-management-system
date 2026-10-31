const API_URL = "http://localhost:5000/api";

export async function getAlerts() {
  const response = await fetch(`${API_URL}/alerts`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch alerts");
  }

  return result;
}

export async function resolveAlert(alertId) {
  const response = await fetch(
    `${API_URL}/alerts/${encodeURIComponent(alertId)}/resolve`,
    {
      method: "PUT",
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to resolve alert");
  }

  return result;
}
