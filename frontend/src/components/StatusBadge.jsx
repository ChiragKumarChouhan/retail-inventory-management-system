export default function StatusBadge({ status }) {
  const styles = {
    "In Stock": "bg-green-50 text-green-700",
    "Low Stock": "bg-amber-50 text-amber-700",
    Critical: "bg-red-50 text-red-700",
    "Out of Stock": "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}
