import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getServices } from "../services/serviceApi";
import toast from "react-hot-toast";

const Services = () => {
  const { organizationId } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await getServices(organizationId);
      setServices(data.services);
    } catch (error) {
      toast.error("Failed to load services");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-3xl font-bold mb-8">
        Available Services
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        {services.map((service) => (

          <div
            key={service._id}
            className="bg-white rounded-xl shadow-lg p-6"
          >

            <h2 className="text-xl font-bold">
              {service.serviceName}
            </h2>

            <p className="mt-2 text-gray-600">
              {service.description}
            </p>

            <p className="mt-3">
              ⏱ Average Time: {service.averageTime} mins
            </p>

            <button
              onClick={() =>
                navigate("/generate-token", {
                  state: {
                    organizationId,
                    serviceId: service._id,
                  },
                })
              }
              className="mt-5 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Generate Token
            </button>

          </div>

        ))}

      </div>

    </div>
  );
};

export default Services;