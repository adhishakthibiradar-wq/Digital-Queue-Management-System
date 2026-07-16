const QueueTable = ({
  queue,
  emptyMessage = "No queue data available.",
  isAdmin = false,
  onComplete,
  onCancel,
  onDelete,
  currentTokenId,
}) => {
  if (!queue?.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full rounded-lg bg-white shadow-sm">
        <thead className="bg-slate-900 text-left text-white">
          <tr>
            <th className="px-4 py-3">Queue Token</th>
            <th className="px-4 py-3">Customer Name</th>
            <th className="px-4 py-3">Organization</th>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Estimated Wait Time</th>
            <th className="px-4 py-3">Created Time</th>
            {isAdmin ? <th className="px-4 py-3">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {queue.map((item) => (
            <tr key={item.itemKey || item._id || `${item.status}-${item.tokenNumber}`} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3">{item.displayToken || `#${item.tokenNumber}`}</td>
              <td className="px-4 py-3">{item.user?.name || "Pending"}</td>
              <td className="px-4 py-3">{item.organization?.name || item.organizationName || "—"}</td>
              <td className="px-4 py-3">{item.service?.serviceName || item.serviceName || "—"}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-3">{item.estimatedWaitTime ?? "—"}</td>
              <td className="px-4 py-3">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</td>
              {isAdmin ? (
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {item.status === "Serving" ? (
                      <button
                        onClick={() => onComplete?.(item)}
                        className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Complete
                      </button>
                    ) : null}
                    {item.status === "Waiting" ? (
                      <button
                        onClick={() => onCancel?.(item)}
                        className="rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                      >
                        Cancel
                      </button>
                    ) : null}
                    {(item.status === "Completed" || item.status === "Cancelled") ? (
                      <button
                        onClick={() => onDelete?.(item)}
                        className="rounded bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Delete
                      </button>
                    ) : null}
                    {item.status === "Serving" && currentTokenId === item._id ? null : null}
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QueueTable;