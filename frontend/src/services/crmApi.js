import api from "./api";

/* ================= DASHBOARD ================= */

// ➜ CRM Dashboard Stats
export const getCRMDashboardStats = () =>
  api.get("/crm/dashboard/stats");


/* ================= ORDERS ================= */

// ➜ ADD ORDER
export const addOrderApi = (data) =>
  api.post("/crm/orders", data);

// ➜ GET ORDERS
export const getOrdersApi = () =>
  api.get("/crm/orders");


/* ================= WORK QUEUE ================= */

// ➜ ADD TASK
export const addWorkTaskApi = (data) =>
  api.post("/crm/tasks", data);

// ➜ GET TASKS
export const getWorkTasksApi = () =>
  api.get("/crm/tasks");


/* ================= OPTIONAL (Future Safe) ================= */

// Delete Order
export const deleteOrderApi = (id) =>
  api.delete(`/crm/orders/${id}`);

// Delete Task
export const deleteTaskApi = (id) =>
  api.delete(`/crm/tasks/${id}`);