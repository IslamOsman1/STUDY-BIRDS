export type Role = "student" | "admin" | "partner";

export interface ArticleContent {
  articleTitle?: string;
  articleTitleColor?: string;
  articleHeadingColor?: string;
  articleBodyColor?: string;
  articleHeadings?: string[];
  articleBodies?: string[];
}

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

export interface Country extends ArticleContent {
  _id: string;
  name: string;
  slug: string;
  code: string;
  description?: string;
  visaNotes?: string;
  heroImage?: string;
  universityCount?: number;
  specialtyCount?: number;
  averageTuition?: number;
  featured?: boolean;
  createdAt?: string;
}

export interface SiteSettings {
  _id?: string;
  contactEmail?: string;
  whatsappUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  britishMembershipUrl?: string;
  supportHours?: string;
  officeLocations?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface UpcomingEvent {
  _id?: string;
  title?: string;
  subtitle?: string;
  eventType?: string;
  eventDate?: string | null;
  ctaText?: string;
  backgroundImage?: string;
  isPublished?: boolean;
}

export interface PastEventMediaItem {
  _id?: string;
  type: "image" | "video";
  url: string;
}

export interface PastEvent {
  _id: string;
  title: string;
  slug?: string;
  category: "expos-fairs" | "our-community" | "webinars" | "partnerships";
  eventDate?: string | null;
  countryCode?: string;
  summary?: string;
  coverImage?: string;
  mediaItems?: PastEventMediaItem[];
  featured?: boolean;
  sortOrder?: number;
  createdAt?: string;
}

export interface EventRegistration {
  _id: string;
  name: string;
  phone: string;
  fieldOfInterest: string;
  currentCountry: string;
  upcomingEvent?: {
    _id?: string;
    title?: string;
    eventDate?: string | null;
  } | null;
  createdAt?: string;
}

export interface StudyField {
  _id: string;
  name: string;
  slug?: string;
  titleColor?: string;
  description?: string;
  image?: string;
  featured?: boolean;
  sortOrder?: number;
  createdAt?: string;
}

export interface University extends ArticleContent {
  _id: string;
  name: string;
  slug: string;
  city?: string;
  language?: string;
  studentCount?: number;
  specialtyCount?: number;
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

export interface Program extends ArticleContent {
  _id: string;
  title: string;
  slug: string;
  degreeLevel: string;
  fieldOfStudy: string;
  fieldsOfStudy?: string[];
  language?: string;
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

export interface AgencyRequest {
  _id: string;
  status: "pending" | "approved" | "rejected";
  student?: User;
  studentNote?: string;
  adminNote?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  _id: string;
  studentName: string;
  destination?: string;
  quote: string;
  avatar?: string;
  rating?: number;
  featured?: boolean;
  createdAt?: string;
}

export interface Recognition {
  _id: string;
  slug?: string;
  title: string;
  image?: string;
  link?: string;
  detailTitle?: string;
  detailBody?: string;
  detailImage?: string;
  featured?: boolean;
  sortOrder?: number;
  createdAt?: string;
}

export interface OurService {
  _id: string;
  slug?: string;
  title: string;
  image?: string;
  detailTitle?: string;
  detailBody?: string;
  detailImage?: string;
  featured?: boolean;
  sortOrder?: number;
  country?: Country | string | null;
  createdAt?: string;
}

export interface OurStoryFounder {
  _id?: string;
  name: string;
  role?: string;
  bio?: string;
  image?: string;
}

export interface OurStoryTimelineItem {
  _id?: string;
  year?: string;
  dateLabel?: string;
  title?: string;
  body?: string;
  image?: string;
  sortOrder?: number;
}

export interface OurStoryImpactStat {
  _id?: string;
  value?: string;
  label?: string;
}

export interface OurStory {
  _id?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroBody?: string;
  heroImage?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  storyEyebrow?: string;
  storyTitle?: string;
  storyBody?: string;
  storyImage?: string;
  missionTitle?: string;
  missionBody?: string;
  visionTitle?: string;
  visionBody?: string;
  foundersTitle?: string;
  foundersBody?: string;
  founders?: OurStoryFounder[];
  timelineTitle?: string;
  timelineBody?: string;
  timelineItems?: OurStoryTimelineItem[];
  impactTitle?: string;
  impactBody?: string;
  impactStats?: OurStoryImpactStat[];
  isPublished?: boolean;
}

export interface Faq {
  _id: string;
  question: string;
  answer: string;
  featured?: boolean;
  sortOrder?: number;
  country?: Country | string | null;
  createdAt?: string;
}

export interface ExhibitionArticle extends ArticleContent {
  _id: string;
  title: string;
  slug: string;
  customSlug?: string;
  image?: string;
  summary: string;
  body: string;
  titleColor?: string;
  ctaText?: string;
  ctaUrl?: string;
  youtubeUrl: string;
  featured?: boolean;
  published?: boolean;
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  imageAltText?: string;
  robotsIndex?: "index" | "noindex";
  robotsFollow?: "follow" | "nofollow";
  category?: string;
  country?: Country | string | null;
  authorName?: string;
  publishedAt?: string | null;
  seoUpdatedAt?: string | null;
  sections?: Array<{
    title: string;
    summary?: string;
    body: string;
    titleColor?: string;
    youtubeUrl: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  resolvedSeo?: {
    articleUrl: string;
    canonicalUrl: string;
    seoTitle: string;
    metaDescription: string;
    focusKeyword?: string;
    seoKeywords: string[];
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    imageAltText: string;
    robotsIndex: "index" | "noindex";
    robotsFollow: "follow" | "nofollow";
    category: string;
    categorySlug: string;
    authorName: string;
    publishedAt?: string | null;
    updatedAt?: string | null;
  };
  articleSchema?: Record<string, unknown>;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
}

export interface HomePageContent {
  countries: Country[];
  studyFields: StudyField[];
  universities: University[];
  testimonials: Testimonial[];
  recognitions: Recognition[];
  services: OurService[];
  faqs: Faq[];
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
