import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMyQueue, cancelToken } from "../services/queueApi";

const MyQueue = () => {
  const [queue, setQueue] = useState(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const { data } = await getMyQueue();
      setQueue(data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "No Active Queue"
      );
    }
  };

  const handleCancel = async () => {
    try {
      await cancelToken(queue.tokenId);

      toast.success("Token Cancelled");

      setQueue(null);
    } catch (error) {
      toast.error("Unable to cancel token");
    }
  };

  if (!queue) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h2 className="text-2xl font-bold">
          No Active Queue
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">

      <div className="bg-white shadow-lg rounded-xl p-8 w-[450px]">

        <h1 className="text-3xl font-bold text-center mb-6">
          My Queue
        </h1>

        <div className="space-y-4">

          <p>
            <strong>Organization:</strong> {queue.organization}
          </p>

          <p>
            <strong>Service:</strong> {queue.service}
          </p>

          <p>
            <strong>Token:</strong> #{queue.tokenNumber}
          </p>

          <p>
            <strong>Queue Position:</strong> {queue.queuePosition}
          </p>

          <p>
            <strong>Estimated Wait:</strong> {queue.estimatedWaitTime} mins
          </p>

          <p>
            <strong>Status:</strong> {queue.status}
          </p>

        </div>

        <button
          onClick={handleCancel}
          className="w-full mt-6 bg-red-600 text-white py-3 rounded hover:bg-red-700"
        >
          Cancel Token
        </button>

      </div>

    </div>
  );
};

export default MyQueue;