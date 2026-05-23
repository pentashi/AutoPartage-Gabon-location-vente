import {
  Contract,
  DashboardStats,
  AuditLog,
  Driver,
  Incident,
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
    let errorMessage = `Request failed: ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.message === "Validation failed" && errorData.issues) {
        // Handle Zod validation errors
        const fieldErrors = errorData.issues.fieldErrors;
        const messages = Object.entries(fieldErrors)
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(", ")}`)
          .join(" | ");
        errorMessage = `Validation échouée: ${messages}`;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      const text = await res.text();
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
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
  signup: (fullName: string, email: string, password: string) =>
    request<User>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password })
    }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  dashboardStats: () => request<DashboardStats>("/dashboard/stats"),
  dashboardAuditLogs: () => request<AuditLog[]>("/dashboard/audit-logs"),
  users: () => request<User[]>("/users"),
  createUser: (payload: any) =>
    request<User>("/users", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateUser: (id: string, payload: any) =>
    request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
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
  markNotificationRead: (id: string) => request<Notification>(`/notifications/${id}/read`, { method: "PATCH" }),
  incidents: () => request<Incident[]>("/incidents"),
  createIncident: (payload: {
    title: string;
    description: string;
    vehicleId?: string;
    driverId?: string;
  }) =>
    request<Incident>("/incidents", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateIncidentStatus: (id: string, status: Incident["status"], note?: string) =>
    request<Incident>(`/incidents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note })
    })
};
