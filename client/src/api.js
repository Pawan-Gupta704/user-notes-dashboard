const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) localStorage.removeItem("token");
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  signup: (payload) =>
    request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  resetPassword: (payload) =>
    request("/auth/forgot-password", { method: "POST", body: payload }),
  me: async () => (await request("/auth/me")).user,
  listMessages: async () => (await request("/messages")).messages,
  createMessage: async (message) =>
    (await request("/messages", { method: "POST", body: { message } })).message,
  updateMessage: async (id, message) =>
    (await request(`/messages/${id}`, { method: "PUT", body: { message } }))
      .message,
  deleteMessage: (id) => request(`/messages/${id}`, { method: "DELETE" }),
};
