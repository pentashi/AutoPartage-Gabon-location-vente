import {
  Contract,
  Driver,
  GpsCommand,
  GpsLocation,
  MaintenanceTask,
  Notification,
  Payment,
  User,
  Vehicle
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
let csrfToken: string | null = null;

async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  const res = await fetch(`${API_URL}/auth/csrf-token`, { credentials: "include" });
  if (!res.ok) {
    throw new Error("Unable to initialize CSRF token");
  }

  const data = (await res.json()) as { csrfToken: string };
  csrfToken = data.csrfToken;
  return csrfToken;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const needsCsrf = !["GET", "HEAD", "OPTIONS"].includes(method);
  const doFetch = async () => {
    const token = needsCsrf ? await getCsrfToken() : null;
    return fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-csrf-token": token } : {}),
        ...(init?.headers ?? {})
      }
    });
  };

  let res = await doFetch();
  if (needsCsrf && res.status === 403) {
    csrfToken = null;
    res = await doFetch();
  }

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(errorBody || `Request failed: ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<User>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  users: () => request<User[]>("/users"),
  vehicles: () => request<Vehicle[]>("/vehicles"),
  drivers: () => request<Driver[]>("/drivers"),
  contracts: () => request<Contract[]>("/contracts"),
  payments: () => request<Payment[]>("/payments"),
  gpsLatestLocation: (vehicleId: string) => request<GpsLocation>(`/gps/vehicles/${vehicleId}/location/latest`),
  gpsImmobilize: (vehicleId: string, reason?: string) =>
    request<GpsCommand>(`/gps/vehicles/${vehicleId}/commands/immobilize`, {
      method: "POST",
      body: JSON.stringify({ reason })
    }),
  gpsRelease: (vehicleId: string, reason?: string) =>
    request<GpsCommand>(`/gps/vehicles/${vehicleId}/commands/release`, {
      method: "POST",
      body: JSON.stringify({ reason })
    }),
  maintenanceTasks: () => request<MaintenanceTask[]>("/maintenance/tasks"),
  updateMaintenanceStatus: (id: string, status: MaintenanceTask["status"]) =>
    request<MaintenanceTask>(`/maintenance/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  notifications: () => request<Notification[]>("/notifications"),
  markNotificationRead: (id: string) => request<Notification>(`/notifications/${id}/read`, { method: "PATCH" })
};
