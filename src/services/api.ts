import {
  User,
  Complaint,
  AppNotification,
  AnalyticsData,
  AttendanceRecord,
  StudentAttendanceSummary,
  AttendanceStats,
} from "../types";

const API_BASE = "/api";

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const errorMessage = data?.error || data?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMessage);
  }
  return data as T;
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleResponse<{ message: string; user: User }>(res);
  },

  async register(studentData: {
    name: string;
    studentId: string;
    email: string;
    phone?: string;
    department: string;
    year: string;
    password: string;
  }): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    });
    return handleResponse<{ message: string; user: User }>(res);
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`);
    return handleResponse<User[]>(res);
  },

  async getUser(id: string): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`);
    return handleResponse<User>(res);
  },

  async updateUser(id: string, data: Partial<User>): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string; user: User }>(res);
  },

  // Complaints
  async getComplaints(params?: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
  }): Promise<Complaint[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== "All") query.append(key, val);
      });
    }
    const res = await fetch(`${API_BASE}/complaints?${query.toString()}`);
    return handleResponse<Complaint[]>(res);
  },

  async getComplaint(id: string): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}`);
    return handleResponse<Complaint>(res);
  },

  async getStudentComplaints(studentId: string): Promise<Complaint[]> {
    const res = await fetch(`${API_BASE}/complaints/student/${encodeURIComponent(studentId)}`);
    return handleResponse<Complaint[]>(res);
  },

  async createComplaint(data: {
    title: string;
    category: string;
    location: string;
    priority?: string;
    description: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    department: string;
  }): Promise<{ message: string; complaint: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string; complaint: Complaint }>(res);
  },

  async updateComplaint(
    id: string,
    data: {
      status?: string;
      priority?: string;
      adminRemarks?: string;
    }
  ): Promise<{ message: string; complaint: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string; complaint: Complaint }>(res);
  },

  async deleteComplaint(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return handleResponse<{ message: string }>(res);
  },

  // Notifications
  async getNotifications(userId: string): Promise<AppNotification[]> {
    const res = await fetch(`${API_BASE}/notifications/${encodeURIComponent(userId)}`);
    return handleResponse<AppNotification[]>(res);
  },

  async markNotificationRead(id: string): Promise<{ message: string; notification: AppNotification }> {
    const res = await fetch(`${API_BASE}/notifications/${encodeURIComponent(id)}/read`, {
      method: "PUT",
    });
    return handleResponse<{ message: string; notification: AppNotification }>(res);
  },

  async markAllNotificationsRead(userId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/notifications/read-all/${encodeURIComponent(userId)}`, {
      method: "PUT",
    });
    return handleResponse<{ message: string }>(res);
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch(`${API_BASE}/analytics`);
    return handleResponse<AnalyticsData>(res);
  },

  // Attendance & Face Recognition
  async getAttendance(params?: {
    date?: string;
    department?: string;
    status?: string;
    search?: string;
  }): Promise<AttendanceRecord[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== "All") query.append(key, val);
      });
    }
    const res = await fetch(`${API_BASE}/attendance?${query.toString()}`);
    return handleResponse<AttendanceRecord[]>(res);
  },

  async getStudentAttendance(studentId: string): Promise<StudentAttendanceSummary> {
    const res = await fetch(`${API_BASE}/attendance/student/${encodeURIComponent(studentId)}`);
    return handleResponse<StudentAttendanceSummary>(res);
  },

  async getAttendanceStats(): Promise<AttendanceStats> {
    const res = await fetch(`${API_BASE}/attendance/stats`);
    return handleResponse<AttendanceStats>(res);
  },

  async markAttendance(data: {
    studentId: string;
    verificationMethod?: string;
    confidenceScore?: number;
    photoSnapshot?: string;
    session?: string;
    notes?: string;
  }): Promise<{ message: string; alreadyRecorded: boolean; record: AttendanceRecord }> {
    const res = await fetch(`${API_BASE}/attendance/mark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string; alreadyRecorded: boolean; record: AttendanceRecord }>(res);
  },

  async enrollFace(data: {
    studentId: string;
    photoSnapshot?: string;
  }): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/attendance/enroll-face`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string; user: User }>(res);
  },

  async updateAttendanceStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<{ message: string; record: AttendanceRecord }> {
    const res = await fetch(`${API_BASE}/attendance/${encodeURIComponent(id)}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse<{ message: string; record: AttendanceRecord }>(res);
  },
};
