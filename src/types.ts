export type UserRole = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  year?: string;
  phone?: string;
  createdAt?: string;
  totalComplaints?: number;
  resolvedComplaints?: number;
  status?: string;
  faceEnrolled?: boolean;
  faceEnrolledAt?: string;
  facePhoto?: string;
  attendancePercentage?: number;
}

export type ComplaintCategory =
  | "Electricity"
  | "Water"
  | "Wi-Fi"
  | "Classroom"
  | "Laboratory"
  | "Hostel"
  | "Cleanliness"
  | "Furniture"
  | "Canteen"
  | "Other";

export type ComplaintLocation =
  | "Block A"
  | "Block B"
  | "Block C"
  | "Hostel"
  | "Library"
  | "Laboratory"
  | "Canteen"
  | "Playground"
  | "Parking"
  | "Other";

export type ComplaintPriority = "Low" | "Medium" | "High";

export type ComplaintStatus =
  | "Submitted"
  | "Under Review"
  | "In Progress"
  | "Resolved"
  | "Rejected";

export interface ComplaintTimelineStep {
  status: ComplaintStatus | string;
  timestamp: string;
  note: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  title: string;
  category: ComplaintCategory;
  location: ComplaintLocation;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  description: string;
  adminRemarks?: string;
  createdAt: string;
  updatedAt: string;
  timeline: ComplaintTimelineStep[];
}

export interface AppNotification {
  id: string;
  userId: string;
  complaintId?: string | null;
  title: string;
  message: string;
  type: "status_change" | "submission" | "remark" | "resolved" | "system";
  read: boolean;
  createdAt: string;
}

export interface AnalyticsData {
  totalComplaints: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  resolutionRate: number;
  avgResolutionTime: string;
  totalStudents: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  monthlyComplaints: { month: string; count: number }[];
  recentComplaints: Complaint[];
}

export type AttendanceStatus = "Present" | "Late" | "Absent" | "Excused";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRoll: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. 09:15 AM
  status: AttendanceStatus;
  verificationMethod: "Face Recognition" | "Manual Override" | "Biometric Kiosk";
  confidenceScore: number; // e.g. 98.4
  photoSnapshot?: string;
  session: string;
  notes?: string;
  createdAt: string;
}

export interface StudentAttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
  eligibilityStatus: "Eligible" | "Warning" | "Shortage"; // >= 75% is Eligible
  faceEnrolled: boolean;
  faceEnrolledAt?: string;
  facePhoto?: string;
  records: AttendanceRecord[];
}

export interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  attendanceRateToday: number;
  byDepartment: Record<string, { total: number; present: number; rate: number }>;
  recentLogs: AttendanceRecord[];
}

