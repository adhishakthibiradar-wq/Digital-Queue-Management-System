import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createService, getServices, updateService } from "../services/serviceApi";
import { getOrganizations } from "../services/organizationApi";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const Services = () => {
  const { organizationId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    organization: organizationId || "",
    serviceName: "",
    description: "",
    averageTime: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    serviceName: "",
    description: "",
    averageTime: "",
    isActive: true,
  });
  const [editError, setEditError] = useState("");

  useEffect(() => {
    fetchServices();
  }, [organizationId]);

  const fetchServices = async () => {
    try {
      setLoading(true);

      if (!organizationId) {
        const { data: organizationsData } = await getOrganizations();
        const organizations = organizationsData?.organizations || [];
        const allServices = [];

        for (const organization of organizations) {
          const { data } = await getServices(organization._id);
          const servicesForOrg = (data.services || []).map((service) => ({
            ...service,
            organization: service.organization || { name: organization.name },
          }));
          allServices.push(...servicesForOrg);
        }

        setServices(allServices);
        return;
      }

      const { data } = await getServices(organizationId);
      setServices(data.services || []);
    } catch (error) {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === "checkbox" ? checked : value;
    setEditFormData((previous) => ({ ...previous, [name]: fieldValue }));
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setEditFormData({
      serviceName: service.serviceName || "",
      description: service.description || "",
      averageTime: service.averageTime ?? "",
      isActive: service.isActive !== false,
    });
    setEditError("");
    setEditing(true);
  };

  const closeEditModal = () => {
    setEditing(false);
    setEditingService(null);
    setEditFormData({
      serviceName: "",
      description: "",
      averageTime: "",
      isActive: true,
    });
    setEditError("");
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editingService?._id) {
      setEditError("No service selected");
      return;
    }

    const trimmedName = editFormData.serviceName.trim();
    const parsedAverageTime = Number(editFormData.averageTime);

    if (!trimmedName) {
      setEditError("Service name is required");
      return;
    }

    if (!Number.isFinite(parsedAverageTime) || parsedAverageTime < 0) {
      setEditError("Average time must be a valid non-negative number");
      return;
    }

    try {
      setEditing(false);
      await updateService(editingService._id, {
        serviceName: trimmedName,
        description: editFormData.description.trim(),
        averageTime: parsedAverageTime,
        isActive: editFormData.isActive,
      });
      toast.success("Service updated successfully");
      closeEditModal();
      fetchServices();
    } catch (error) {
      setEditError(error.response?.data?.message || "Failed to update service");
      setEditing(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      await createService({ ...formData, organization: organizationId });
      toast.success("Service created successfully");
      setFormData({
        organization: organizationId || "",
        serviceName: "",
        description: "",
        averageTime: "",
      });
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create service");
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
          <h1 className="text-3xl font-bold text-slate-900">Available Services</h1>
          <p className="mt-1 text-sm text-slate-500">Choose a service to generate a queue token.</p>
        </div>
      </div>

      {isAdmin ? (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Create Service</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input name="serviceName" value={formData.serviceName} onChange={handleChange} className="rounded-lg border border-gray-300 p-3" placeholder="Service name" required />
            <input name="averageTime" type="number" value={formData.averageTime} onChange={handleChange} className="rounded-lg border border-gray-300 p-3" placeholder="Average time in mins" required />
            <textarea name="description" value={formData.description} onChange={handleChange} className="rounded-lg border border-gray-300 p-3 md:col-span-2" placeholder="Service description" required />
          </div>
          <button type="submit" disabled={submitting} className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
            {submitting ? "Creating..." : "Create Service"}
          </button>
        </form>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        {services.map((service) => (
          <div key={service._id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{service.serviceName}</h2>
                {service.organization?.name ? (
                  <p className="mt-1 text-sm font-medium text-blue-600">{service.organization.name}</p>
                ) : null}
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${service.isActive === false ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                {service.isActive === false ? "Inactive" : "Active"}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{service.description}</p>
            <p className="mt-4 text-sm text-slate-600">⏱ Average Time: {service.averageTime} mins</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() =>
                  navigate("/generate-token", {
                    state: {
                      organizationId,
                      serviceId: service._id,
                      organizationName: service.organization?.name || "Organization",
                      serviceName: service.serviceName,
                    },
                  })
                }
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Generate Token
              </button>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => openEditModal(service)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Edit
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Edit Service</h3>
              <button type="button" onClick={closeEditModal} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
                Close
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
              {editError ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {editError}
                </div>
              ) : null}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Service Name</label>
                <input
                  name="serviceName"
                  value={editFormData.serviceName}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-gray-300 p-3"
                  placeholder="Service name"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-gray-300 p-3"
                  placeholder="Service description"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Average Time (mins)</label>
                <input
                  name="averageTime"
                  type="number"
                  min="0"
                  value={editFormData.averageTime}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-gray-300 p-3"
                  placeholder="Average time"
                  required
                />
              </div>

              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={editFormData.isActive}
                  onChange={handleEditChange}
                />
                Active service
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeEditModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Services;