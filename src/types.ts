export interface TimeEntry {
  id: string;
  taskName: string;
  category: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  duration: number;  // in seconds
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind color class prefix or hex code
  bgColor: string;
  accentColor: string;
  icon: string; // Lucide icon name
}

export interface Streak {
  currentStreak: number;
  lastTrackedDate: string | null; // YYYY-MM-DD
}

export interface StaffMember {
  id: string;
  name: string;
  department: string;
  avatarText: string;
  baseSalary: number; // in local currency (e.g., USD or NGN)
  salaryMultiplier: number; // e.g., 1.0 (standard), 0.8 (deductions), 1.1 (increments)
  attitudeStatus: 'Working' | 'Sleeping' | 'Idle';
  attitudeMessage: string;
  clockInStatus: 'Clocked In' | 'Clocked Out';
  lastClockTime: string | null;
  email?: string;
  password?: string;
  role?: 'Staff';
}

export interface Organization {
  id: string; // org slug / key
  name: string;
  superAdminName: string;
  superAdminEmail: string;
  superAdminPassword?: string;
  createdAt: string;
}

export interface SubAdmin {
  id: string;
  name: string;
  email: string;
  password?: string;
  departmentScope: string;
  role: 'SubAdmin';
  createdAt: string;
}

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: 'SuperAdmin' | 'SubAdmin' | 'Staff';
  orgId: string;
  orgName: string;
}

export interface CCTVFeed {
  id: string;
  name: string;
  location: string;
  isDeviceCamera: boolean;
  activeStaffIds: string[];
}

export interface OwnerRemarkLog {
  id: string;
  staffId: string;
  staffName: string;
  timestamp: string;
  remark: string;
  actionType: 'deduction' | 'increase' | 'none';
  percentageChange: number; // e.g., 20 for 20% or 10 for 10%
  salaryBefore: number;
  salaryInstated: number;
}

