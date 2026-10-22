export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: "admin" | "manager" | "user";
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface Employee {
  id: number;
  employee_id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  hire_date: string;
  assigned_assets?: number;
}

export interface Hardware {
  id: number;
  asset_tag: string;
  type: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  purchase_date: string;
  price: number;
  status: string;
  notes: string;
  assigned_to: number | null;
  assigned_to_name: string | null;
}

export interface Software {
  id: number;
  asset_tag: string;
  name: string;
  manufacturer: string;
  version: string;
  type: string;
  license_type: string;
  total_licenses: number;
  current_users: number;
  purchase_date: string;
  expiry_date: string;
  price: number;
}

export interface Assignment {
  id: number;
  employee_id: number;
  employee_name: string;
  department: string;
  asset_type: "hardware" | "software";
  asset_id: number;
  asset_tag: string;
  asset_model: string;
  assigned_date: string;
  return_date: string | null;
  status: string;
  notes: string;
}

export interface Activity {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  created_at: string;
}

export type Role = "admin" | "manager" | "user";
