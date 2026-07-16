import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createOrganization, getOrganizations } from "../services/organizationApi";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const Organizations = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    type: "Bank",
    address: "",
    phone: "",
    email: "",
    openingTime: "",
    closingTime: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const { data } = await getOrganizations();
      setOrganizations(data.organizations || []);
    } catch (error) {
      toast.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      await createOrganization(formData);
      toast.success("Organization created successfully");
      setFormData({
        name: "",
        type: "Bank",
        address: "",
        phone: "",
        email: "",
        openingTime: "",
        closingTime: "",
      });
      fetchOrganizations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create organization");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Organizations</h1>
          <p className="mt-1 text-sm text-slate-500">Browse available branches and manage organization records.</p>
        </div>
      </div>

      {isAdmin ? (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Create Organization</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input name="name" value={formData.name} onChange={handleChange} className="rounded-lg border border-gray-300 p-3" placeholder="Organization name" required />
            <select name="type" value={formData.type} onChange={handleChange} className="rounded-lg border border-gray-300 p-3" required>
              <option value="Bank">Bank</option>
              <option value="Hospital">Hospital</option>
              <option value="Interview">Interview</option>
              <option value="Shop">Shop</option>
              <option value="Office">Office</option>
            </select>
            <input name="address" value={formData.address} onChange={handleChange} className="rounded-lg border border-gray-300 p-3" placeholder="Address" required />
            <input name="phone" value={formData.phone} onChange={handleChange} className="rounded-lg border border-gray-300 p-3" placeholder="Phone" required />
            <input name="email" type="email" value={formData.email} onChange={handleChange} className="rounded-lg border border-gray-300 p-3" placeholder="Email" required />
            <input name="openingTime" value={formData.openingTime} onChange={handleChange} className="rounded-lg border border-gray-300 p-3" placeholder="Opening time" required />
            <input name="closingTime" value={formData.closingTime} onChange={handleChange} className="rounded-lg border border-gray-300 p-3" placeholder="Closing time" required />
          </div>
          <button type="submit" disabled={submitting} className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
            {submitting ? "Creating..." : "Create Organization"}
          </button>
        </form>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        {organizations.map((org) => (
          <div key={org._id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">{org.name}</h2>
            <p className="mt-2 text-sm font-medium text-blue-600">{org.type}</p>
            <p className="mt-4 text-sm text-slate-600">📍 {org.address}</p>
            <p className="mt-2 text-sm text-slate-600">📞 {org.phone}</p>
            <p className="mt-2 text-sm text-slate-600">✉️ {org.email}</p>
            <p className="mt-2 text-sm text-slate-600">🕘 {org.openingTime} - {org.closingTime}</p>
            <button onClick={() => navigate(`/services/${org._id}`)} className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              View Services
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Organizations;