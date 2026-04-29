export type Role = "student" | "admin" | "partner";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  authProvider?: "local" | "google";
  emailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface Country {
  _id: string;
  name: string;
  slug: string;
  code: string;
  description?: string;
  visaNotes?: string;
  heroImage?: string;
  featured?: boolean;
  createdAt?: string;
}

export interface University {
  _id: string;
  name: string;
  slug: string;
  city?: string;
  overview?: string;
  ranking?: number;
  featured?: boolean;
  isPartnerInstitution?: boolean;
  logo?: string;
  campusImages?: string[];
  tuitionRange?: {
    min?: number;
    max?: number;
  };
  country?: Country;
  createdAt?: string;
}

export interface Program {
  _id: string;
  title: string;
  slug: string;
  degreeLevel: string;
  fieldOfStudy: string;
  duration?: string;
  tuition?: number;
  partnerTuition?: number;
  applicationDeadline?: string;
  intake?: string;
  requirements?: string[];
  summary?: string;
  popularity?: number;
  coverImage?: string;
  university?: University;
  featured?: boolean;
  createdAt?: string;
}

export interface DocumentItem {
  _id: string;
  type: string;
  fileName: string;
  filePath: string;
  status: "pending" | "verified" | "rejected";
}

export interface ApplicantProfileSnapshot {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  currentEducation?: string;
  gpa?: string;
  intake?: string;
  address?: string;
  englishTest?: {
    exam?: string;
    score?: string;
  };
}

export interface Application {
  _id: string;
  status: string;
  notes?: string;
  submittedAt?: string;
  createdAt?: string;
  reviewedBy?: string | User;
  program?: Program;
  student?: User;
  documents?: DocumentItem[];
  applicantProfile?: ApplicantProfileSnapshot;
  studentProfile?: ApplicantProfileSnapshot;
  statusTimeline?: Array<{
    status: string;
    note?: string;
    changedAt?: string;
    changedBy?: string | User;
  }>;
}

export interface StudentProfile {
  _id?: string;
  user?: User;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  currentEducation?: string;
  gpa?: string;
  intake?: string;
  bio?: string;
  address?: string;
  targetCountries?: string[];
  englishTest?: {
    exam?: string;
    score?: string;
  };
}

export interface Testimonial {
  _id: string;
  studentName: string;
  destination?: string;
  quote: string;
  rating?: number;
  featured?: boolean;
  createdAt?: string;
}

export interface ExhibitionArticle {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  youtubeUrl: string;
  featured?: boolean;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AdminOverview {
  stats: {
    users: number;
    students: number;
    admins: number;
    partners: number;
    inactiveUsers: number;
    universities: number;
    programs: number;
    applications: number;
    submittedApplications: number;
    underReviewApplications: number;
  };
  recentApplications: Application[];
  recentUsers: User[];
  applicationsByStatus: Record<string, number>;
}
