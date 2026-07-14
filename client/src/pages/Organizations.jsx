import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrganizations } from "../services/organizationApi";
import toast from "react-hot-toast";

const Organizations = () => {
    const navigate = useNavigate(); 
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data } = await getOrganizations();
      setOrganizations(data.organizations);
    } catch (error) {
      toast.error("Failed to load organizations");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-3xl font-bold mb-8">
        Organizations
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        {organizations.map((org) => (

          <div
            key={org._id}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold">
              {org.name}
            </h2>

            <p className="text-gray-600 mt-2">
              {org.type}
            </p>

            <p className="mt-2">
              📍 {org.address}
            </p>

            <p className="mt-2">
              🕘 {org.openingTime} - {org.closingTime}
            </p>

            <button
  onClick={() => navigate(`/services/${org._id}`)}
  className="mt-5 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
  View Services
</button>
          </div>

        ))}

      </div>

    </div>
  );
};

export default Organizations;