import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { callNextToken, cancelToken, completeToken, deleteQueue, getDashboard, getQueue } from "../services/queueApi";
import { getOrganizations } from "../services/organizationApi";
import { getServices } from "../services/serviceApi";
import Loader from "../components/Loader";
import TokenCard from "../components/TokenCard";
import QueueTable from "../components/QueueTable";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const buildDisplayToken = (item) => {
    const organizationName = item.organization?.name || item.organizationName || "ORG";
    const serviceName = item.service?.serviceName || item.serviceName || "SRV";
    const organizationCode = organizationName.slice(0, 3).toUpperCase();
    const serviceCode = serviceName.slice(0, 3).toUpperCase();

    return `${organizationCode}-${serviceCode}-${item.tokenNumber}`;
  };

  const getQueueItemKey = (item) => {
    if (item?._id) {
      return item._id;
    }

    return `${item?.status || "unknown"}-${item?.tokenNumber || "0"}-${item?.organization?.name || item?.organizationName || ""}-${item?.service?.serviceName || item?.serviceName || ""}`;
  };

  useEffect(() => {
    fetchDashboard();

    const refreshQueue = () => {
      fetchDashboard();
    };

    window.addEventListener("queue:updated", refreshQueue);
    return () => window.removeEventListener("queue:updated", refreshQueue);
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await getDashboard();
      setDashboard(data?.dashboard ?? null);

      const organizationsResponse = await getOrganizations();
      const organizations = organizationsResponse?.data?.organizations || [];
      const queueEntries = [];

      for (const organization of organizations) {
        const servicesResponse = await getServices(organization._id);
        const services = servicesResponse?.data?.services || [];

        for (const service of services) {
          try {
            const queueResponse = await getQueue(organization._id, service._id);
            const queueItemsForService = queueResponse?.data?.queue || [];

            queueEntries.push(
              ...queueItemsForService.map((item) => {
                const enrichedItem = {
                  ...item,
                  organization: { name: organization.name },
                  service: { serviceName: service.serviceName },
                  displayToken: buildDisplayToken({
                    organization: { name: organization.name },
                    service: { serviceName: service.serviceName },
                    tokenNumber: item.tokenNumber,
                  }),
                };

                return {
                  ...enrichedItem,
                  itemKey: getQueueItemKey(enrichedItem),
                };
              })
            );
          } catch (queueError) {
            if (queueError.response?.status !== 404) {
              console.error("Unable to load queue for service", service._id);
            }
          }
        }
      }

      const sortedQueue = queueEntries.sort((left, right) => left.tokenNumber - right.tokenNumber);
      setQueueItems(sortedQueue);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Access Denied - Admin Only");
      } else {
        setError("Unable to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNextToken = async () => {
    try {
      setProcessing(true);
      await callNextToken();
      window.dispatchEvent(new Event("queue:updated"));
      toast.success("Next token called");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Access Denied - Admin Only");
      } else {
        toast.error(err.response?.data?.message || "Unable to call next token");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteToken = async (item) => {
    if (!item?._id) {
      toast.error("No token selected");
      return;
    }

    try {
      setProcessing(true);
      await completeToken(item._id);
      window.dispatchEvent(new Event("queue:updated"));
      toast.success("Token completed");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Access Denied - Admin Only");
      } else {
        toast.error(err.response?.data?.message || "Unable to complete token");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelToken = async (item) => {
    if (!item?._id) {
      toast.error("No token selected");
      return;
    }

    try {
      setProcessing(true);
      await cancelToken(item._id);
      window.dispatchEvent(new Event("queue:updated"));
      toast.success("Token cancelled");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Access Denied - Admin Only");
      } else {
        toast.error(err.response?.data?.message || "Unable to cancel token");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteToken = async (item) => {
    const itemKey = item?.itemKey || item?._id;

    if (!itemKey) {
      toast.error("No token selected");
      return;
    }

    const confirmed = window.confirm("Delete this queue record?");

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);
      await deleteQueue(item._id || itemKey);
      setQueueItems((previousItems) => previousItems.filter((queueItem) => (queueItem.itemKey || queueItem._id) !== itemKey));
      window.dispatchEvent(new Event("queue:updated"));
      toast.success("Queue record deleted successfully");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Access Denied - Admin Only");
      } else {
        toast.error(err.response?.data?.message || "Unable to delete queue record");
      }
    } finally {
      setProcessing(false);
    }
  };

  const currentServing = queueItems.find((item) => item.status === "Serving");
  const nextWaiting = queueItems.find((item) => item.status === "Waiting");

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Only Admin Can Access This Dashboard</h2>
            <p className="mt-3 text-sm text-slate-600">Please sign in with an administrator account to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        <div className="flex-1 p-6 md:p-10">
          <Loader />
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">{error || "Unable to load dashboard"}</h2>
            <p className="mt-3 text-sm text-slate-600">Please try again in a moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Monitor queue activity and manage the next token.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleNextToken}
              disabled={processing}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {processing ? "Processing..." : "Call Next Token"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          <TokenCard
            title="Current Serving"
            value={currentServing ? `#${currentServing.tokenNumber}` : "—"}
            subtitle={currentServing?.user?.name ? `Customer: ${currentServing.user.name}` : "No token is currently being served."}
          />
          <TokenCard
            title="Next Token"
            value={nextWaiting ? `#${nextWaiting.tokenNumber}` : "—"}
            subtitle={nextWaiting ? "Ready to call" : "No waiting tokens"}
          />
          <TokenCard title="Waiting Count" value={dashboard.waitingCount ?? 0} subtitle="Tokens still pending" />
          <TokenCard title="Completed Count" value={dashboard.completedCount ?? 0} subtitle="Tokens completed" />
          <TokenCard title="Total Tokens" value={dashboard.totalTokens ?? queueItems.length} subtitle="All queue records" />
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Queue Overview</h2>
            <span className="text-sm text-slate-500">{queueItems.length} queue records</span>
          </div>

          <QueueTable
            queue={queueItems}
            isAdmin={isAdmin}
            onComplete={handleCompleteToken}
            onCancel={handleCancelToken}
            onDelete={handleDeleteToken}
            emptyMessage="No queue activity to display right now."
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;