const API_BASE = "/api";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("inventory_token");

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401 && !endpoint.includes("/auth/login")) {
      localStorage.removeItem("inventory_token");
      localStorage.removeItem("inventory_user");
      window.location.reload();
    }
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

// Auth
export const auth = {
  login: (username: string, password: string) =>
    request<{ token: string; user: import("@/types").User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  sso: (osToken: string) =>
    request<{ token: string; user: import("@/types").User }>("/auth/sso", {
      method: "POST",
      body: JSON.stringify({ token: osToken }),
    }),
};

// Employees
export const employees = {
  list: () => request<import("@/types").Employee[]>("/employees"),
  create: (data: Partial<import("@/types").Employee>) =>
    request<import("@/types").Employee>("/employees", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<import("@/types").Employee>) =>
    request<import("@/types").Employee>(`/employees/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request(`/employees/${id}`, { method: "DELETE" }),
};

// Hardware
export const hardware = {
  list: () => request<import("@/types").Hardware[]>("/hardware"),
  create: (data: Partial<import("@/types").Hardware>) =>
    request<import("@/types").Hardware>("/hardware", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<import("@/types").Hardware>) =>
    request<import("@/types").Hardware>(`/hardware/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// Software
export const software = {
  list: () => request<import("@/types").Software[]>("/software"),
  create: (data: Partial<import("@/types").Software>) =>
    request<import("@/types").Software>("/software", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<import("@/types").Software>) =>
    request<import("@/types").Software>(`/software/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request(`/software/${id}`, { method: "DELETE" }),
};

// Assignments
export const assignments = {
  list: () => request<import("@/types").Assignment[]>("/assignments"),
  create: (data: Record<string, unknown>) =>
    request<import("@/types").Assignment>("/assignments", { method: "POST", body: JSON.stringify(data) }),
  returnAsset: (id: number) =>
    request(`/assignments/${id}/return`, { method: "PUT", body: JSON.stringify({ notes: "" }) }),
};

// Activities
export const activities = {
  list: (limit = 20) => request<import("@/types").Activity[]>(`/activities?limit=${limit}`),
};

// Users (admin only)
export const users = {
  list: () => request<import("@/types").User[]>("/admin/users"),
  create: (data: Record<string, unknown>) =>
    request<import("@/types").User>("/admin/users", { method: "POST", body: JSON.stringify(data) }),
  updateRole: (id: number, role: string) =>
    request(`/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
  updateStatus: (id: number, is_active: boolean) =>
    request(`/admin/users/${id}/status`, { method: "PUT", body: JSON.stringify({ is_active }) }),
  syncGoogle: (code: string) => request("/admin/google-sync", { method: "POST", body: JSON.stringify({ code }) }),
  googleConfig: () => request<{ clientId: string }>("/admin/google-sync/config"),
};

// Subscriptions
export const subscriptions = {
  list: () => request<import("@/types").Subscription[]>("/subscriptions"),
  get: (id: number) => request<import("@/types").Subscription>(`/subscriptions/${id}`),
  create: (data: Record<string, unknown>) =>
    request<import("@/types").Subscription>("/subscriptions", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    request<import("@/types").Subscription>(`/subscriptions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request(`/subscriptions/${id}`, { method: "DELETE" }),
};

// Payments
export const payments = {
  list: () => request<import("@/types").PaymentRecord[]>("/payments"),
  create: (data: Record<string, unknown>) =>
    request<import("@/types").PaymentRecord>("/payments", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: number) => request(`/payments/${id}`, { method: "DELETE" }),
};

// Anthropic
export const anthropic = {
  config: () => request<{ configured: boolean }>("/admin/anthropic-config"),
  usage: (startingAt?: string, endingAt?: string) => {
    const params = new URLSearchParams();
    if (startingAt) params.set("starting_at", startingAt);
    if (endingAt) params.set("ending_at", endingAt);
    const qs = params.toString();
    return request<import("@/types").AnthropicUsageResponse>(`/admin/anthropic-usage${qs ? `?${qs}` : ""}`);
  },
};

// Reports
export const reports = {
  costSummary: () => request<import("@/types").CostSummary>("/reports/cost-summary"),
  upcomingRenewals: (days = 90) => request<import("@/types").Subscription[]>(`/reports/upcoming-renewals?days=${days}`),
};

// Excel export helper
export const exportToExcel = async (dataType: string) => {
  const XLSX = await import("xlsx");
  let data: Record<string, unknown>[] = [];
  let filename = "";

  switch (dataType) {
    case "employees": {
      const list = await employees.list();
      data = list.map((e) => ({ 사번: e.employee_id, 이름: e.name, 부서: e.department, 이메일: e.email, 연락처: e.phone }));
      filename = "임직원목록";
      break;
    }
    case "hardware": {
      const list = await hardware.list();
      data = list.map((h) => ({
        자산태그: h.asset_tag, 유형: h.type, 제조사: h.manufacturer, 모델명: h.model,
        시리얼번호: h.serial_number, 구입일: h.purchase_date, 상태: h.status, 할당자: h.assigned_to_name,
      }));
      filename = "하드웨어자산";
      break;
    }
    case "software": {
      const list = await software.list();
      data = list.map((s) => ({
        자산태그: s.asset_tag, 소프트웨어명: s.name, 제조사: s.manufacturer, 버전: s.version,
        유형: s.type, 라이선스유형: s.license_type, 총라이선스: s.total_licenses, 사용중: s.current_users,
      }));
      filename = "소프트웨어";
      break;
    }
    case "assignments": {
      const list = await assignments.list();
      data = list.map((a) => ({
        할당일: a.assigned_date, 임직원: a.employee_name, 부서: a.department,
        자산유형: a.asset_type, 자산태그: a.asset_tag, 모델명: a.asset_model, 상태: a.status,
      }));
      filename = "자산할당";
      break;
    }
    case "users": {
      const list = await users.list();
      data = list.map((u) => ({
        사용자명: u.username, 이름: u.full_name, 이메일: u.email,
        권한: u.role === "admin" ? "관리자" : u.role === "manager" ? "매니저" : "사용자",
        상태: u.is_active ? "활성" : "비활성", 생성일: u.created_at, 최근로그인: u.last_login,
      }));
      filename = "사용자목록";
      break;
    }
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, filename);
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
