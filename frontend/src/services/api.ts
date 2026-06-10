const API_BASE = "http://127.0.0.1:8000/api/v1";

export interface AgentLog {
  id: number;
  session_id: string;
  agent_name: string;
  action: string;
  thought: string;
  output_data: string;
  timestamp: string;
}

export interface GeneratedScript {
  id: string;
  session_id: string;
  filename: string;
  content: string;
  language: string;
  description: string;
  created_at: string;
}

export interface VerificationReport {
  id: string;
  session_id: string;
  passed: boolean;
  score: number;
  summary: string;
  details: string; // Serialized JSON array of strings
  pdf_path?: string;
  created_at: string;
}

export interface DeploymentSession {
  id: string;
  name: string;
  target_os: string;
  requirements: string;
  status: string; // pending, planning, generating, auditing, verifying, completed, failed
  created_at: string;
  updated_at: string;
  agent_logs?: AgentLog[];
  scripts?: GeneratedScript[];
  reports?: VerificationReport[];
}

export interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
}

export interface TroubleshootResult {
  root_cause: string;
  solution: string;
  recovery_script: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "Admin" | "Support Engineer" | "Employee";
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  active_sessions: number;
  installation_requests: number;
  reports_generated: number;
}

// Helper to inject Authorization headers automatically if token exists in localStorage
const getHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { ...additionalHeaders };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Authentication APIs
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string; user: UserProfile }> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Authentication failed");
    }
    return response.json();
  },

  async register(fullName: string, email: string, password: string, role: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, email, password, role })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Registration failed");
    }
    return response.json();
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: getHeaders()
    });
    if (!response.ok) throw new Error("Logout request failed");
  },

  async getMe(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error("Failed to fetch user session");
    return response.json();
  },

  async updateProfile(fullName: string, email: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: "PUT",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ full_name: fullName, email })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to update profile");
    }
    return response.json();
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/me/change-password`, {
      method: "PUT",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to change password");
    }
  },

  // Admin User Management APIs
  async getUsers(): Promise<UserProfile[]> {
    const response = await fetch(`${API_BASE}/users/`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error("Failed to fetch user list");
    return response.json();
  },

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to delete user");
    }
  },

  async updateUserRole(id: string, role: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE}/users/${id}/role`, {
      method: "PUT",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ role })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to update user role");
    }
    return response.json();
  },

  async getAdminStats(): Promise<AdminStats> {
    const response = await fetch(`${API_BASE}/users/stats`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error("Failed to fetch admin stats");
    return response.json();
  },

  // Deployments API
  async getDeployments(): Promise<DeploymentSession[]> {
    const response = await fetch(`${API_BASE}/deployments/`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error("Failed to fetch deployments history");
    return response.json();
  },

  async getDeployment(id: string): Promise<DeploymentSession> {
    const response = await fetch(`${API_BASE}/deployments/${id}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error(`Failed to fetch deployment session ${id}`);
    return response.json();
  },

  async createDeployment(name: string, targetOs: string, requirements: string): Promise<DeploymentSession> {
    const response = await fetch(`${API_BASE}/deployments/`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ name, target_os: targetOs, requirements })
    });
    if (!response.ok) throw new Error("Failed to create deployment request");
    return response.json();
  },

  async deleteDeployment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/deployments/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    if (!response.ok) throw new Error(`Failed to delete deployment session ${id}`);
  },

  // Download helpers
  getScriptDownloadUrl(scriptId: string): string {
    const token = localStorage.getItem("token") || "";
    // Note: since standard download links redirect directly in browser, we can append token as query parameter
    // if backend supports it. For this assignment, we maintain simple URL retrieval.
    return `${API_BASE}/scripts/${scriptId}/download?token=${token}`;
  },

  getReportDownloadUrl(reportId: string): string {
    const token = localStorage.getItem("token") || "";
    return `${API_BASE}/reports/${reportId}/download?token=${token}`;
  },

  // AI Assistant Chat API
  async chatWithAssistant(message: string, history: ChatMessage[]): Promise<string> {
    const response = await fetch(`${API_BASE}/assistant/chat`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ message, history })
    });
    if (!response.ok) throw new Error("DevOps assistant chat failed");
    const data = await response.json();
    return data.response;
  },

  // Troubleshooting API
  async analyzeError(errorLog: string, scriptContext: string = ""): Promise<TroubleshootResult> {
    const response = await fetch(`${API_BASE}/troubleshoot/analyze`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ error_log: errorLog, script_context: scriptContext })
    });
    if (!response.ok) throw new Error("Troubleshooting analysis failed");
    return response.json();
  }
};
