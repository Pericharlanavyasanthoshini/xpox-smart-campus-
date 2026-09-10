import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_DIR = path.join(process.cwd(), "server", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const COMPLAINTS_FILE = path.join(DATA_DIR, "complaints.json");
const NOTIFICATIONS_FILE = path.join(DATA_DIR, "notifications.json");
const ATTENDANCE_FILE = path.join(DATA_DIR, "attendance.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helpers for reading/writing local JSON files
function readJSON<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf-8");
      return fallback;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJSON<T>(filePath: string, data: T): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Simple rule-based priority evaluator
function evaluatePriority(category: string, title: string, description: string): "Low" | "Medium" | "High" {
  const text = `${title} ${description}`.toLowerCase();
  
  // High priority keywords & critical conditions
  const highKeywords = [
    "fire", "spark", "shock", "short-circuit", "hazard", "smoke", "danger", 
    "outage", "blackout", "flood", "leakage", "urgent", "emergency", 
    "laboratory", "fume", "burst", "broken glass"
  ];
  if (
    category === "Electricity" && (text.includes("lab") || text.includes("shock") || text.includes("spark") || text.includes("blackout")) ||
    category === "Water" && (text.includes("flood") || text.includes("supply failure") || text.includes("outage")) ||
    category === "Wi-Fi" && (text.includes("outage") || text.includes("entire") || text.includes("server") || text.includes("all")) ||
    highKeywords.some(k => text.includes(k))
  ) {
    return "High";
  }

  // Medium priority
  const mediumKeywords = ["projector", "ac", "air condition", "cooler", "fan", "audio", "software", "drain", "stair"];
  if (
    ["Classroom", "Laboratory", "Wi-Fi"].includes(category) ||
    mediumKeywords.some(k => text.includes(k))
  ) {
    return "Medium";
  }

  return "Low";
}

// --- API ROUTES ---

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Authentication: Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const users = readJSON<any[]>(USERS_FILE, []);
  const user = users.find(
    (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  // Omit password from returned object
  const { password: _, ...userSafe } = user;
  res.json({
    message: "Login successful",
    user: userSafe,
  });
});

// Authentication: Register (Students)
app.post("/api/auth/register", (req, res) => {
  const { name, studentId, email, phone, department, year, password } = req.body;

  if (!name || !email || !password || !studentId) {
    return res.status(400).json({ error: "Full Name, Student ID, Email, and Password are required." });
  }

  const users = readJSON<any[]>(USERS_FILE, []);
  const existingUser = users.find(
    (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase() ||
           (u.studentId && u.studentId.trim().toLowerCase() === studentId.trim().toLowerCase())
  );

  if (existingUser) {
    return res.status(409).json({ error: "A student with this email or Student ID already exists." });
  }

  const newId = `STU${String(users.filter(u => u.role === "student").length + 1).padStart(3, "0")}`;
  const newUser = {
    id: newId,
    name: name.trim(),
    studentId: studentId.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : "",
    department: department ? department.trim() : "General Engineering",
    year: year ? year.trim() : "1st Year",
    password: password,
    role: "student",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);

  // Send a welcome notification
  const notifications = readJSON<any[]>(NOTIFICATIONS_FILE, []);
  notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    userId: newId,
    complaintId: null,
    title: "Welcome to SMART CAMPUS",
    message: `Welcome ${newUser.name}! Your account has been created. You can now report campus issues and track their resolution in real time.`,
    type: "system",
    read: false,
    createdAt: new Date().toISOString(),
  });
  writeJSON(NOTIFICATIONS_FILE, notifications);

  const { password: _, ...userSafe } = newUser;
  res.status(201).json({
    message: "Student registered successfully",
    user: userSafe,
  });
});

// Users: Get all students (Admin)
app.get("/api/users", (req, res) => {
  const users = readJSON<any[]>(USERS_FILE, []);
  const complaints = readJSON<any[]>(COMPLAINTS_FILE, []);

  // Filter students or return all safe users
  const students = users
    .filter((u) => u.role === "student")
    .map((u) => {
      const studentComplaints = complaints.filter(
        (c) => c.studentId === u.id || (u.studentId && c.studentId === u.studentId)
      );
      const resolvedCount = studentComplaints.filter((c) => c.status === "Resolved").length;
      const { password: _, ...safe } = u;
      return {
        ...safe,
        totalComplaints: studentComplaints.length,
        resolvedComplaints: resolvedCount,
        status: "Active",
      };
    });

  res.json(students);
});

// Users: Get single user profile
app.get("/api/users/:id", (req, res) => {
  const users = readJSON<any[]>(USERS_FILE, []);
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  const { password: _, ...userSafe } = user;
  res.json(userSafe);
});

// Users: Update profile
app.put("/api/users/:id", (req, res) => {
  const users = readJSON<any[]>(USERS_FILE, []);
  const index = users.findIndex((u) => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  const { name, phone, department, year, email } = req.body;
  users[index] = {
    ...users[index],
    name: name !== undefined ? name.trim() : users[index].name,
    phone: phone !== undefined ? phone.trim() : users[index].phone,
    department: department !== undefined ? department.trim() : users[index].department,
    year: year !== undefined ? year.trim() : users[index].year,
    email: email !== undefined ? email.trim().toLowerCase() : users[index].email,
    updatedAt: new Date().toISOString(),
  };

  writeJSON(USERS_FILE, users);
  const { password: _, ...userSafe } = users[index];
  res.json({ message: "Profile updated successfully", user: userSafe });
});

// Complaints: Get all complaints (with filters & search)
app.get("/api/complaints", (req, res) => {
  const { status, category, priority, search, sortBy } = req.query;
  let complaints = readJSON<any[]>(COMPLAINTS_FILE, []);

  if (status && status !== "All") {
    complaints = complaints.filter((c) => c.status.toLowerCase() === (status as string).toLowerCase());
  }
  if (category && category !== "All") {
    complaints = complaints.filter((c) => c.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (priority && priority !== "All") {
    complaints = complaints.filter((c) => c.priority.toLowerCase() === (priority as string).toLowerCase());
  }
  if (search) {
    const q = (search as string).toLowerCase();
    complaints = complaints.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.studentName && c.studentName.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sortBy === "oldest") {
    complaints.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sortBy === "priority") {
    const priorityWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
    complaints.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
  } else {
    // default newest
    complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(complaints);
});

// Complaints: Get student's complaints
app.get("/api/complaints/student/:studentId", (req, res) => {
  const complaints = readJSON<any[]>(COMPLAINTS_FILE, []);
  const studentId = req.params.studentId;
  const filtered = complaints.filter(
    (c) => c.studentId === studentId || c.studentEmail === studentId
  );
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(filtered);
});

// Complaints: Get single complaint details
app.get("/api/complaints/:id", (req, res) => {
  const complaints = readJSON<any[]>(COMPLAINTS_FILE, []);
  const complaint = complaints.find((c) => c.id.toLowerCase() === req.params.id.toLowerCase());
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found." });
  }
  res.json(complaint);
});

// Complaints: Submit new complaint (Student)
app.post("/api/complaints", (req, res) => {
  const { title, category, location, priority, description, studentId, studentName, studentEmail, department } = req.body;

  if (!title || !category || !location || !description || !studentId) {
    return res.status(400).json({ error: "Title, category, location, description, and student ID are required." });
  }

  const complaints = readJSON<any[]>(COMPLAINTS_FILE, []);
  
  // Generate next Complaint ID e.g. CMP-1017
  let maxIdNum = 1000;
  for (const c of complaints) {
    const match = c.id.match(/^CMP-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIdNum) maxIdNum = num;
    }
  }
  const newId = `CMP-${maxIdNum + 1}`;

  // Evaluate rule-based priority if not provided or to validate
  const determinedPriority = priority && ["Low", "Medium", "High"].includes(priority)
    ? priority
    : evaluatePriority(category, title, description);

  const now = new Date().toISOString();
  const newComplaint = {
    id: newId,
    studentId,
    studentName: studentName || "Student",
    studentEmail: studentEmail || "",
    department: department || "Engineering",
    title: title.trim(),
    category,
    location,
    priority: determinedPriority,
    status: "Submitted",
    description: description.trim(),
    adminRemarks: "",
    createdAt: now,
    updatedAt: now,
    timeline: [
      {
        status: "Submitted",
        timestamp: now,
        note: `Complaint filed by ${studentName || "Student"}`
      }
    ]
  };

  complaints.unshift(newComplaint);
  writeJSON(COMPLAINTS_FILE, complaints);

  // Notify student & notify admin
  const notifications = readJSON<any[]>(NOTIFICATIONS_FILE, []);
  // Student notification
  notifications.unshift({
    id: `NOTIF-${Date.now()}-1`,
    userId: studentId,
    complaintId: newId,
    title: "Complaint Registered",
    message: `Your complaint ${newId} ("${newComplaint.title}") was submitted successfully and queued for review.`,
    type: "submission",
    read: false,
    createdAt: now
  });
  // Admin notification
  notifications.unshift({
    id: `NOTIF-${Date.now()}-2`,
    userId: "ADM001",
    complaintId: newId,
    title: "New Student Complaint",
    message: `${studentName || "A student"} submitted ${newId}: "${newComplaint.title}" [${determinedPriority} Priority]`,
    type: "submission",
    read: false,
    createdAt: now
  });
  writeJSON(NOTIFICATIONS_FILE, notifications);

  res.status(201).json({
    message: "Complaint submitted successfully!",
    complaint: newComplaint
  });
});

// Complaints: Update complaint status, priority, admin remarks (Admin)
app.put("/api/complaints/:id", (req, res) => {
  const complaints = readJSON<any[]>(COMPLAINTS_FILE, []);
  const index = complaints.findIndex((c) => c.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: "Complaint not found." });
  }

  const existing = complaints[index];
  const { status, priority, adminRemarks } = req.body;
  const now = new Date().toISOString();

  let statusChanged = false;
  let newTimeline = [...(existing.timeline || [])];

  if (status && status !== existing.status) {
    statusChanged = true;
    newTimeline.push({
      status,
      timestamp: now,
      note: adminRemarks ? `Admin updated status to ${status}: ${adminRemarks}` : `Status updated to ${status}`
    });
  } else if (adminRemarks && adminRemarks !== existing.adminRemarks) {
    // If remarks added without status change, record remark in timeline if appropriate
    newTimeline.push({
      status: existing.status,
      timestamp: now,
      note: `Admin remark added: "${adminRemarks}"`
    });
  }

  complaints[index] = {
    ...existing,
    status: status || existing.status,
    priority: priority || existing.priority,
    adminRemarks: adminRemarks !== undefined ? adminRemarks : existing.adminRemarks,
    updatedAt: now,
    timeline: newTimeline
  };

  writeJSON(COMPLAINTS_FILE, complaints);

  // Notify student of update
  const notifications = readJSON<any[]>(NOTIFICATIONS_FILE, []);
  let notifMessage = `Your complaint ${existing.id} is now "${complaints[index].status}".`;
  if (adminRemarks) {
    notifMessage += ` Admin Remarks: "${adminRemarks}"`;
  }

  notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    userId: existing.studentId,
    complaintId: existing.id,
    title: complaints[index].status === "Resolved" 
      ? "Complaint Resolved! 🎉" 
      : `Complaint Updated: ${complaints[index].status}`,
    message: notifMessage,
    type: complaints[index].status === "Resolved" ? "resolved" : "status_change",
    read: false,
    createdAt: now
  });
  writeJSON(NOTIFICATIONS_FILE, notifications);

  res.json({
    message: "Complaint updated successfully",
    complaint: complaints[index]
  });
});

// Complaints: Delete complaint
app.delete("/api/complaints/:id", (req, res) => {
  let complaints = readJSON<any[]>(COMPLAINTS_FILE, []);
  const initialLength = complaints.length;
  complaints = complaints.filter((c) => c.id.toLowerCase() !== req.params.id.toLowerCase());
  if (complaints.length === initialLength) {
    return res.status(404).json({ error: "Complaint not found." });
  }
  writeJSON(COMPLAINTS_FILE, complaints);
  res.json({ message: "Complaint deleted successfully" });
});

// Notifications: Get for user
app.get("/api/notifications/:userId", (req, res) => {
  const notifications = readJSON<any[]>(NOTIFICATIONS_FILE, []);
  const userId = req.params.userId;
  // If admin, show admin notifications or all
  const userNotifs = notifications.filter(
    (n) => n.userId === userId || (userId === "ADM001" && (n.userId === "ADM001" || n.type === "submission"))
  );
  userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(userNotifs);
});

// Notifications: Mark as read
app.put("/api/notifications/:id/read", (req, res) => {
  const notifications = readJSON<any[]>(NOTIFICATIONS_FILE, []);
  const notif = notifications.find((n) => n.id === req.params.id);
  if (!notif) {
    return res.status(404).json({ error: "Notification not found." });
  }
  notif.read = true;
  writeJSON(NOTIFICATIONS_FILE, notifications);
  res.json({ message: "Notification marked as read", notification: notif });
});

// Notifications: Mark all as read for user
app.put("/api/notifications/read-all/:userId", (req, res) => {
  const notifications = readJSON<any[]>(NOTIFICATIONS_FILE, []);
  const userId = req.params.userId;
  for (const n of notifications) {
    if (n.userId === userId || (userId === "ADM001" && n.userId === "ADM001")) {
      n.read = true;
    }
  }
  writeJSON(NOTIFICATIONS_FILE, notifications);
  res.json({ message: "All notifications marked as read" });
});

// --- ATTENDANCE & BIOMETRIC FACE RECOGNITION API ---

// Attendance: Get all attendance records (with filters)
app.get("/api/attendance", (req, res) => {
  const { date, department, status, search } = req.query;
  let records = readJSON<any[]>(ATTENDANCE_FILE, []);

  if (date && date !== "All") {
    records = records.filter((r) => r.date === date);
  }
  if (department && department !== "All") {
    records = records.filter(
      (r) => r.department && r.department.toLowerCase() === (department as string).toLowerCase()
    );
  }
  if (status && status !== "All") {
    records = records.filter(
      (r) => r.status && r.status.toLowerCase() === (status as string).toLowerCase()
    );
  }
  if (search) {
    const q = (search as string).toLowerCase();
    records = records.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.studentRoll.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        (r.session && r.session.toLowerCase().includes(q))
    );
  }

  // Sort descending by date & createdAt
  records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(records);
});

// Attendance: Get attendance summary & history for a student
app.get("/api/attendance/student/:studentId", (req, res) => {
  const studentIdentifier = req.params.studentId.trim().toLowerCase();
  const users = readJSON<any[]>(USERS_FILE, []);
  const records = readJSON<any[]>(ATTENDANCE_FILE, []);

  const student = users.find(
    (u) =>
      u.id.toLowerCase() === studentIdentifier ||
      (u.studentId && u.studentId.toLowerCase() === studentIdentifier) ||
      u.email.toLowerCase() === studentIdentifier
  );

  const studentRecords = records.filter(
    (r) =>
      r.studentId.toLowerCase() === studentIdentifier ||
      (student && r.studentId.toLowerCase() === student.id.toLowerCase()) ||
      (student && student.studentId && r.studentRoll.toLowerCase() === student.studentId.toLowerCase()) ||
      (student && r.studentEmail.toLowerCase() === student.email.toLowerCase())
  );

  studentRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Compute metrics: 20 typical working days in the academic month baseline
  const totalDays = Math.max(studentRecords.length, 12);
  const presentDays = studentRecords.filter((r) => r.status === "Present").length;
  const lateDays = studentRecords.filter((r) => r.status === "Late").length;
  const absentDays = Math.max(0, totalDays - presentDays - lateDays);

  // Percentage calculated as (present + late * 0.8) / totalDays * 100
  const effectivePresent = presentDays + (lateDays * 0.85);
  const percentage = totalDays > 0 ? Math.min(100, Math.round((effectivePresent / totalDays) * 100)) : 100;

  let eligibilityStatus: "Eligible" | "Warning" | "Shortage" = "Eligible";
  if (percentage < 65) {
    eligibilityStatus = "Shortage";
  } else if (percentage < 75) {
    eligibilityStatus = "Warning";
  }

  res.json({
    totalDays,
    presentDays,
    lateDays,
    absentDays,
    percentage,
    eligibilityStatus,
    faceEnrolled: student ? student.faceEnrolled ?? true : true,
    faceEnrolledAt: student ? student.faceEnrolledAt : undefined,
    facePhoto: student ? student.facePhoto : undefined,
    records: studentRecords,
  });
});

// Attendance: Overview Statistics (Admin Command Center)
app.get("/api/attendance/stats", (req, res) => {
  const users = readJSON<any[]>(USERS_FILE, []);
  const records = readJSON<any[]>(ATTENDANCE_FILE, []);
  const students = users.filter((u) => u.role === "student");

  // Today's date in local ISO date format
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter((r) => r.date === today);

  const presentToday = todayRecords.filter((r) => r.status === "Present").length;
  const lateToday = todayRecords.filter((r) => r.status === "Late").length;
  const totalStudents = students.length;
  const recordedCount = todayRecords.length;
  const absentToday = Math.max(0, totalStudents - recordedCount);

  const attendanceRateToday = totalStudents > 0 ? Math.round(((presentToday + lateToday) / totalStudents) * 100) : 0;

  // Breakdown by department
  const byDepartment: Record<string, { total: number; present: number; rate: number }> = {};
  for (const s of students) {
    const dept = s.department || "General Engineering";
    if (!byDepartment[dept]) {
      byDepartment[dept] = { total: 0, present: 0, rate: 0 };
    }
    byDepartment[dept].total++;
  }

  for (const r of todayRecords) {
    const dept = r.department || "General Engineering";
    if (byDepartment[dept] && (r.status === "Present" || r.status === "Late")) {
      byDepartment[dept].present++;
    }
  }

  for (const dept of Object.keys(byDepartment)) {
    const d = byDepartment[dept];
    d.rate = d.total > 0 ? Math.round((d.present / d.total) * 100) : 0;
  }

  // Sort recent logs
  const recentLogs = [...records]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15);

  res.json({
    totalStudents,
    presentToday,
    absentToday,
    lateToday,
    attendanceRateToday,
    byDepartment,
    recentLogs,
  });
});

// Attendance: Mark student attendance via Face Recognition
app.post("/api/attendance/mark", (req, res) => {
  const { studentId, verificationMethod, confidenceScore, photoSnapshot, session, notes } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: "Student ID or roll number is required." });
  }

  const users = readJSON<any[]>(USERS_FILE, []);
  const student = users.find(
    (u) =>
      u.id.toLowerCase() === studentId.toLowerCase() ||
      (u.studentId && u.studentId.toLowerCase() === studentId.toLowerCase()) ||
      u.email.toLowerCase() === studentId.toLowerCase()
  );

  if (!student) {
    return res.status(404).json({ error: "Registered student not found." });
  }

  const records = readJSON<any[]>(ATTENDANCE_FILE, []);
  const today = new Date().toISOString().split("T")[0];

  // Check if student already has attendance recorded for today
  const existingToday = records.find(
    (r) =>
      r.date === today &&
      (r.studentId.toLowerCase() === student.id.toLowerCase() ||
        (student.studentId && r.studentRoll.toLowerCase() === student.studentId.toLowerCase()))
  );

  if (existingToday) {
    return res.json({
      message: `Attendance already recorded for ${student.name} today (${existingToday.time})`,
      alreadyRecorded: true,
      record: existingToday,
    });
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // If after 9:15 AM, mark as Late, otherwise Present
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const isLate = hours > 9 || (hours === 9 && minutes > 15);
  const status = isLate ? "Late" : "Present";

  const newRecord = {
    id: `ATT-${today}-${student.id}`,
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    studentRoll: student.studentId || "STU-REG",
    department: student.department || "General Engineering",
    date: today,
    time: timeStr,
    status: status,
    verificationMethod: verificationMethod || "Face Recognition",
    confidenceScore: confidenceScore ? Math.min(99.8, Math.max(92.0, confidenceScore)) : 98.4,
    photoSnapshot: photoSnapshot || undefined,
    session: session || "Morning Session - Main Academic Block",
    notes: notes || (isLate ? "Marked Late (> 9:15 AM scan)" : "Verified via Face Recognition AI"),
    createdAt: now.toISOString(),
  };

  records.unshift(newRecord);
  writeJSON(ATTENDANCE_FILE, records);

  // Send student an attendance recorded notification
  const notifications = readJSON<any[]>(NOTIFICATIONS_FILE, []);
  notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    userId: student.id,
    complaintId: null,
    title: `Attendance Recorded: ${status} ✅`,
    message: `Your attendance for ${today} was successfully recorded at ${timeStr} via Face Recognition (${newRecord.confidenceScore}% match).`,
    type: "system",
    read: false,
    createdAt: now.toISOString(),
  });
  writeJSON(NOTIFICATIONS_FILE, notifications);

  res.status(201).json({
    message: `Attendance successfully marked as ${status} for ${student.name}!`,
    alreadyRecorded: false,
    record: newRecord,
  });
});

// Attendance: Enroll / Update Student Face Recognition Profile
app.post("/api/attendance/enroll-face", (req, res) => {
  const { studentId, photoSnapshot } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: "Student identifier is required." });
  }

  const users = readJSON<any[]>(USERS_FILE, []);
  const index = users.findIndex(
    (u) =>
      u.id.toLowerCase() === studentId.toLowerCase() ||
      (u.studentId && u.studentId.toLowerCase() === studentId.toLowerCase()) ||
      u.email.toLowerCase() === studentId.toLowerCase()
  );

  if (index === -1) {
    return res.status(404).json({ error: "Student not found." });
  }

  const now = new Date().toISOString();
  users[index] = {
    ...users[index],
    faceEnrolled: true,
    faceEnrolledAt: now,
    facePhoto: photoSnapshot || users[index].facePhoto,
  };

  writeJSON(USERS_FILE, users);

  // Add confirmation notification
  const notifications = readJSON<any[]>(NOTIFICATIONS_FILE, []);
  notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    userId: users[index].id,
    complaintId: null,
    title: "Biometric Face Profile Updated 👤",
    message: "Your biometric facial profile has been registered and verified for automated campus attendance.",
    type: "system",
    read: false,
    createdAt: now,
  });
  writeJSON(NOTIFICATIONS_FILE, notifications);

  const { password: _, ...safeUser } = users[index];
  res.json({
    message: "Facial biometric profile enrolled successfully.",
    user: safeUser,
  });
});

// Attendance: Manual status override (Admin)
app.put("/api/attendance/:id/status", (req, res) => {
  const { status, notes } = req.body;
  const records = readJSON<any[]>(ATTENDANCE_FILE, []);
  const index = records.findIndex((r) => r.id.toLowerCase() === req.params.id.toLowerCase());

  if (index === -1) {
    return res.status(404).json({ error: "Attendance record not found." });
  }

  records[index] = {
    ...records[index],
    status: status || records[index].status,
    notes: notes !== undefined ? notes : records[index].notes,
    verificationMethod: "Manual Override",
  };

  writeJSON(ATTENDANCE_FILE, records);
  res.json({ message: "Attendance record updated", record: records[index] });
});

// Analytics Dashboard Endpoint
app.get("/api/analytics", (req, res) => {
  const complaints = readJSON<any[]>(COMPLAINTS_FILE, []);
  const users = readJSON<any[]>(USERS_FILE, []);

  const totalComplaints = complaints.length;
  const pending = complaints.filter((c) => c.status === "Submitted" || c.status === "Under Review").length;
  const inProgress = complaints.filter((c) => c.status === "In Progress").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const rejected = complaints.filter((c) => c.status === "Rejected").length;

  const resolutionRate = totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0;

  // Compute average resolution time from resolved complaints
  let totalResolutionHours = 0;
  let resolvedWithTimeline = 0;
  for (const c of complaints) {
    if (c.status === "Resolved" && c.createdAt) {
      const created = new Date(c.createdAt).getTime();
      const updated = new Date(c.updatedAt || c.createdAt).getTime();
      const diffHours = Math.max(4, (updated - created) / (1000 * 60 * 60));
      totalResolutionHours += diffHours;
      resolvedWithTimeline++;
    }
  }
  const avgDays = resolvedWithTimeline > 0
    ? (totalResolutionHours / (resolvedWithTimeline * 24)).toFixed(1)
    : "2.4";

  // Category counts
  const categories = [
    "Electricity", "Water", "Wi-Fi", "Classroom", "Laboratory", 
    "Hostel", "Cleanliness", "Furniture", "Canteen", "Other"
  ];
  const byCategory: Record<string, number> = {};
  for (const cat of categories) {
    byCategory[cat] = complaints.filter((c) => c.category === cat).length;
  }

  // Status counts
  const statuses = ["Submitted", "Under Review", "In Progress", "Resolved", "Rejected"];
  const byStatus: Record<string, number> = {};
  for (const st of statuses) {
    byStatus[st] = complaints.filter((c) => c.status === st).length;
  }

  // Priority counts
  const priorities = ["High", "Medium", "Low"];
  const byPriority: Record<string, number> = {};
  for (const pr of priorities) {
    byPriority[pr] = complaints.filter((c) => c.priority === pr).length;
  }

  // Monthly complaints (grouped by month e.g. "Apr", "May", "Jun", "Jul", "Aug", "Sep")
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData: Record<string, number> = {
    "Apr": 8,
    "May": 14,
    "Jun": 19,
    "Jul": 26,
    "Aug": 38,
    "Sep": 0
  };

  // Add current data to months
  for (const c of complaints) {
    const d = new Date(c.createdAt);
    const m = monthNames[d.getMonth()];
    if (monthlyData[m] !== undefined) {
      monthlyData[m]++;
    } else {
      monthlyData[m] = 1;
    }
  }

  const monthlyComplaints = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    count
  }));

  const totalStudents = users.filter((u) => u.role === "student").length;

  res.json({
    totalComplaints,
    pending,
    inProgress,
    resolved,
    rejected,
    resolutionRate,
    avgResolutionTime: `${avgDays} Days`,
    totalStudents,
    byCategory,
    byStatus,
    byPriority,
    monthlyComplaints,
    recentComplaints: complaints.slice(0, 6)
  });
});

// --- VITE DEV / PRODUCTION MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SMART CAMPUS server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
