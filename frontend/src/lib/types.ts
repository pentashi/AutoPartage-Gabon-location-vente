export type Role = "SUPER_ADMIN" | "ADMIN" | "ACCOUNTANT" | "DRIVER" | "GARAGE";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive?: boolean;
};

export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  plateNumber: string;
  year: number;
  status: "ACTIVE" | "IMMOBILIZED" | "MAINTENANCE";
};

export type Driver = {
  id: string;
  licenseNumber: string;
  cnssNumber?: string;
  cnamgsNumber?: string;
  riskScore: number;
};

export type Contract = {
  id: string;
  type: "RENTAL" | "SALE";
  status: "ACTIVE" | "LATE" | "SUSPENDED" | "TERMINATED";
  monthlyAmount: string;
};

export type Payment = {
  id: string;
  amount: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  dueDate: string;
};

export type GpsLocation = {
  id: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  speedKph?: number | null;
  ignitionOn: boolean;
  trackerOnline: boolean;
  recordedAt: string;
};

export type GpsCommand = {
  id: string;
  vehicleId: string;
  command: "IMMOBILIZE" | "RELEASE";
  status: "PENDING" | "SENT" | "ACKNOWLEDGED" | "FAILED" | "TIMED_OUT";
  reason?: string | null;
  createdAt: string;
};

export type MaintenanceTask = {
  id: string;
  vehicleId: string;
  title: string;
  description?: string | null;
  status: "PLANNED" | "IN_PROGRESS" | "OVERDUE" | "COMPLETED" | "CANCELED";
  escalationLvl: number;
  dueDate?: string | null;
  dueMileageKm?: number | null;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  channel: "IN_APP" | "EMAIL" | "SMS" | "WHATSAPP";
  priority: "CRITICAL" | "HIGH" | "NORMAL";
  isRead: boolean;
  createdAt: string;
};

export type Incident = {
  id: string;
  driverId?: string | null;
  vehicleId?: string | null;
  title: string;
  description: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED";
  occurredAt: string;
  resolvedAt?: string | null;
  createdAt: string;
};
