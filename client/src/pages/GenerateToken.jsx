import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { generateToken } from "../services/queueApi";
import toast from "react-hot-toast";

const GenerateToken = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { organizationId, serviceId } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState(null);

  const handleGenerateToken = async () => {
    try {
      setLoading(true);

      const { data } = await generateToken({
        organization: organizationId,
        service: serviceId,
      });

      setTokenData(data.data);

      toast.success("Token Generated Successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to generate token"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">

      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">

        <h1 className="text-3xl font-bold text-center mb-6">
          Generate Queue Token
        </h1>

        {!tokenData ? (
          <button
            onClick={handleGenerateToken}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
          >
            {loading ? "Generating..." : "Generate Token"}
          </button>
        ) : (
          <div>

            <div className="bg-green-100 rounded-lg p-6 text-center">

              <h2 className="text-2xl font-bold">
                Token #{tokenData.tokenNumber}
              </h2>

              <p className="mt-4">
                Queue Position :
                <strong> {tokenData.queuePosition}</strong>
              </p>

              <p className="mt-2">
                Estimated Wait :
                <strong> {tokenData.estimatedWaitTime} mins</strong>
              </p>

              <p className="mt-2">
                Status :
                <strong> {tokenData.status}</strong>
              </p>

            </div>

            <button
              onClick={() => navigate("/myqueue")}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded hover:bg-green-700"
            >
              View My Queue
            </button>

          </div>
        )}

      </div>

    </div>
  );
};

export default GenerateToken;