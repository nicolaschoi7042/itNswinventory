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

export interface Subscription {
  id: number;
  software_id: number | null;
  software_name: string | null;
  software_vendor: string | null;
  name: string;
  vendor: string;
  status: "active" | "expired" | "cancelled" | "pending";
  billing_cycle: "monthly" | "quarterly" | "yearly" | "one_time";
  amount: number;
  currency: string;
  total_licenses: number | null;
  used_licenses: number;
  start_date: string;
  end_date: string | null;
  renewal_date: string | null;
  auto_renewal: boolean;
  contract_url: string | null;
  notes: string | null;
  created_by_name: string | null;
  created_at: string;
}

export interface PaymentRecord {
  id: number;
  subscription_id: number | null;
  subscription_name: string | null;
  transaction_date: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  approval_number: string | null;
  memo: string | null;
  created_by_name: string | null;
  created_at: string;
}

export interface CostSummary {
  total_subscriptions: number;
  active_count: number;
  expired_count: number;
  monthly_cost: number;
  yearly_cost: number;
  quarterly_cost: number;
  total_licenses: number;
  used_licenses: number;
}

export interface AnthropicUsageResult {
  model?: string;
  uncached_input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation?: { ephemeral_1h_input_tokens: number; ephemeral_5m_input_tokens: number };
}

export interface AnthropicCostResult {
  description?: string;
  workspace_id?: string | null;
  amount: string;
  currency: string;
  model?: string;
  token_type?: string;
}

export interface AnthropicBucket<T> {
  started_at: string;
  ended_at: string;
  results: T[];
}

export interface AnthropicUsageResponse {
  usage: { data: AnthropicBucket<AnthropicUsageResult>[]; has_more: boolean };
  cost: { data: AnthropicBucket<AnthropicCostResult>[]; has_more: boolean };
  period: { starting_at: string; ending_at: string };
}

export type Role = "admin" | "manager" | "user";
