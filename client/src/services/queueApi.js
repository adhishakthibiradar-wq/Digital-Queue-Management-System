import api from "./api";

export const generateToken = (data) => {
  return api.post("/queue", data);
};

export const getMyQueue = () => {
  return api.get("/queue/my");
};

export const getQueue = (organizationId, serviceId) => {
  return api.get(`/queue/${organizationId}/${serviceId}`);
};

export const callNextToken = (data) => {
  return api.put("/queue/next", data);
};

export const completeToken = (queueId) => {
  return api.put(`/queue/complete/${queueId}`);
};

export const cancelToken = (queueId) => {
  return api.put(`/queue/cancel/${queueId}`);
};

export const getDashboard = () => {
  return api.get("/queue/dashboard");
};