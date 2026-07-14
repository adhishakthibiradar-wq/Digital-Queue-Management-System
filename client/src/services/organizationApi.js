import api from "./api";

export const getOrganizations = () => {
  return api.get("/organizations");
};

export const createOrganization = (data) => {
  return api.post("/organizations", data);
};