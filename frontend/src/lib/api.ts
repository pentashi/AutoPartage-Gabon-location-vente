import { Contract, Driver, Payment, User, Vehicle } from "./types";

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
  const token = needsCsrf ? await getCsrfToken() : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-csrf-token": token } : {}),
      ...(init?.headers ?? {})
    }
  });

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
  payments: () => request<Payment[]>("/payments")
};
