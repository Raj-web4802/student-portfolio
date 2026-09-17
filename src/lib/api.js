const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const token = localStorage.getItem("taskmanager_token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body.details?.map((item) => item.message).join(", ");
    const error = new Error(detail || body.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return body;
}

export function register(credentials) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function login(credentials) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function getCurrentUser() {
  return request("/me");
}

export function getTasks() {
  return request("/tasks");
}

export function createTask(task) {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });
}

export function updateTask(id, task) {
  return request(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: "DELETE" });
}
