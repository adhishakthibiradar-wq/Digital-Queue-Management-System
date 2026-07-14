import api from "./api";

export const getServices = (organizationId) => {
  return api.get(`/services/${organizationId}`);
};

export const createService = (data) => {
  return api.post("/services", data);
};