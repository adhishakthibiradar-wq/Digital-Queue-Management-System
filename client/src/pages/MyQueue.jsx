import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMyQueue, cancelToken } from "../services/queueApi";
import Loader from "../components/Loader";

const statusStyles = {
  Waiting: "bg-amber-100 text-amber-800",
  Serving: "bg-blue-100 text-blue-800",
  Completed: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-red-100 text-red-800",
};

const formatDateTime = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const MyQueue = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const { data } = await getMyQueue();
      const payload = data?.queues ?? data?.data ?? [];

      if (Array.isArray(payload)) {
        setQueues(payload);
      } else if (payload && typeof payload === "object") {
        setQueues([payload]);
      } else {
        setQueues([]);
      }
    } catch (error) {
      setQueues([]);

      if (error.response?.status !== 404) {
        toast.error("Failed to load queue history");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (tokenId) => {
    try {
      await cancelToken(tokenId);

      window.dispatchEvent(new Event("queue:updated"));
      toast.success("Token cancelled");
      await fetchQueue();
    } catch (error) {
      toast.error("Unable to cancel token");
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">My Queue History</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review every token you have generated.
            </p>
          </div>
        </div>

        {queues.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-slate-800">
              No queue history found.
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Generate a token to begin tracking your queue history.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr className="text-left text-sm font-semibold text-slate-600">
                    <th className="px-4 py-3">Token Number</th>
                    <th className="px-4 py-3">Organization</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Queue Position</th>
                    <th className="px-4 py-3">Estimated Wait</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queues.map((item) => (
                    <tr key={item.tokenId} className="text-sm text-slate-700">
                      <td className="px-4 py-3 font-semibold text-slate-900">#{item.tokenNumber}</td>
                      <td className="px-4 py-3">{item.organization}</td>
                      <td className="px-4 py-3">{item.service}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[item.status] || "bg-slate-100 text-slate-700"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.queuePosition ?? "—"}</td>
                      <td className="px-4 py-3">{item.estimatedWaitTime} mins</td>
                      <td className="px-4 py-3">{formatDateTime(item.createdAt)}</td>
                      <td className="px-4 py-3">
                        {item.status === "Waiting" ? (
                          <button
                            onClick={() => handleCancel(item.tokenId)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {queues.map((item) => (
                <div key={item.tokenId} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">#{item.tokenNumber}</p>
                      <p className="text-sm text-slate-500">{item.organization}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[item.status] || "bg-slate-100 text-slate-700"}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-medium text-slate-700">Service:</span> {item.service}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">Queue Position:</span>{" "}
                      {item.queuePosition ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">Estimated Wait:</span>{" "}
                      {item.estimatedWaitTime} mins
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">Created:</span>{" "}
                      {formatDateTime(item.createdAt)}
                    </p>
                  </div>

                  {item.status === "Waiting" ? (
                    <button
                      onClick={() => handleCancel(item.tokenId)}
                      className="mt-4 w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      Cancel Token
                    </button>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">No actions available.</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyQueue;