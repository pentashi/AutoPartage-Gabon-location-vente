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
