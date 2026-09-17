/**
 * Central role/constant definitions — single source of truth so the rest of
 * the codebase never compares against raw string literals inconsistently.
 *
 * ADDITIVE CHANGE: "parent" and "university" are NEW account roles alongside
 * the existing "student" / "admin" / "partner". Nothing that already reads
 * User.role breaks — it simply now sees two more possible values it may not
 * branch on yet, which is safe (unhandled values are just ignored, never a
 * crash, since every existing check is an equality/inclusion test).
 */

const ROLES = Object.freeze({
  STUDENT: "student",
  ADMIN: "admin",
  PARTNER: "partner", // existing "agent"-equivalent role
  PARENT: "parent", // NEW
  UNIVERSITY: "university", // NEW
});

const ALL_ROLES = Object.values(ROLES);

/**
 * Employee sub-roles — used ONLY when role === ADMIN. Optional field; admin
 * accounts created before this change simply have employeeRole = null,
 * which existing authorize("admin") checks treat exactly as before (no
 * change to that check — it only ever looked at role, never employeeRole).
 */
const EMPLOYEE_ROLES = Object.freeze({
  EDUCATIONAL_CONSULTANT: "educational_consultant",
  SALES: "sales",
  ADMISSION: "admission",
  ADMISSION_MANAGER: "admission_manager",
  VISA_OFFICER: "visa_officer",
  TRAVEL_COORDINATOR: "travel_coordinator",
  ACCOMMODATION_OFFICER: "accommodation_officer",
  FINANCE: "finance",
  CUSTOMER_SUPPORT: "customer_support",
  BRANCH_MANAGER: "branch_manager",
  OPERATIONS: "operations",
  MARKETING: "marketing",
  UNIVERSITY_RELATIONS: "university_relations",
  AGENT_MANAGER: "agent_manager",
  CONTENT_MANAGER: "content_manager",
  ADMIN_ROLE: "admin", // generic admin sub-role (distinct from the account role "admin")
  SUPER_ADMIN: "super_admin",
});

const ALL_EMPLOYEE_ROLES = Object.values(EMPLOYEE_ROLES);

/**
 * The full 14-stage journey (spec-aligned). This is the NEW granular field
 * (StudentProfile.journeyStage). The EXISTING StudentProfile.applicationStage
 * (6 values) is untouched and keeps driving the website exactly as before —
 * see JOURNEY_STAGE_TO_LEGACY_STAGE below for how the two stay in sync.
 */
const JOURNEY_STAGES = Object.freeze({
  FILE_RECEIVED: "file-received",
  DOCUMENTS_REVIEW: "documents-review",
  UNIVERSITY_SELECTION: "university-selection",
  APPLYING: "applying",
  UNIVERSITY_REVIEW: "university-review",
  PRELIMINARY_ACCEPTED: "preliminary-accepted",
  FIRST_PAYMENT: "first-payment",
  FINAL_ACCEPTED: "final-accepted",
  VISA: "visa",
  TRAVEL: "travel",
  RECEPTION: "reception",
  ACCOMMODATION: "accommodation",
  UNIVERSITY_REGISTRATION: "university-registration",
  STUDIES_STARTED: "studies-started",
});

const ALL_JOURNEY_STAGES = Object.values(JOURNEY_STAGES);

// The EXISTING (untouched) 6-value legacy enum, kept here only for the
// mapping table below — StudentProfile.js still declares this enum itself.
const LEGACY_APPLICATION_STAGES = [
  "file-received",
  "applying",
  "preliminary-accepted",
  "first-payment",
  "final-accepted",
  "travel-and-settlement",
];

// New (14) -> existing (6). Every website view that reads applicationStage
// keeps rendering a value it already recognizes, no matter which of the 14
// granular stages the app sets.
const JOURNEY_STAGE_TO_LEGACY_STAGE = Object.freeze({
  "file-received": "file-received",
  "documents-review": "file-received",
  "university-selection": "file-received",
  applying: "applying",
  "university-review": "applying",
  "preliminary-accepted": "preliminary-accepted",
  "first-payment": "first-payment",
  "final-accepted": "final-accepted",
  visa: "final-accepted",
  travel: "travel-and-settlement",
  reception: "travel-and-settlement",
  accommodation: "travel-and-settlement",
  "university-registration": "travel-and-settlement",
  "studies-started": "travel-and-settlement",
});

/**
 * The full 12-status application lifecycle (spec-aligned). NEW field
 * (Application.detailedStatus). The EXISTING Application.status (5 values)
 * is untouched — see APPLICATION_DETAILED_TO_LEGACY_STATUS below.
 */
const APPLICATION_DETAILED_STATUSES = Object.freeze({
  DRAFT: "draft",
  DOCUMENTS_MISSING: "documents-missing",
  READY_TO_APPLY: "ready-to-apply",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under-review",
  ADDITIONAL_DOCUMENTS_REQUIRED: "additional-documents-required",
  CONDITIONAL_ADMISSION: "conditional-admission",
  PAYMENT_REQUIRED: "payment-required",
  PAYMENT_VERIFICATION: "payment-verification",
  FINAL_ADMISSION: "final-admission",
  VISA_PREPARATION: "visa-preparation",
  COMPLETED: "completed",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
});

const ALL_APPLICATION_DETAILED_STATUSES = Object.values(APPLICATION_DETAILED_STATUSES);

const APPLICATION_DETAILED_TO_LEGACY_STATUS = Object.freeze({
  draft: "draft",
  "documents-missing": "draft",
  "ready-to-apply": "draft",
  submitted: "submitted",
  "under-review": "under-review",
  "additional-documents-required": "under-review",
  "conditional-admission": "under-review",
  "payment-required": "under-review",
  "payment-verification": "under-review",
  "final-admission": "accepted",
  "visa-preparation": "accepted",
  completed: "accepted",
  accepted: "accepted",
  rejected: "rejected",
});

/**
 * The full 8-status document lifecycle (spec-aligned). NEW field
 * (Document.detailedStatus). The EXISTING Document.status (3 values) is
 * untouched — see DOCUMENT_DETAILED_TO_LEGACY_STATUS below.
 */
const DOCUMENT_DETAILED_STATUSES = Object.freeze({
  MISSING: "missing",
  UPLOADED: "uploaded",
  UNDER_REVIEW: "under-review",
  APPROVED: "approved",
  REJECTED: "rejected",
  NEEDS_REVISION: "needs-revision",
  NEEDS_TRANSLATION: "needs-translation",
  EXPIRED: "expired",
});

const ALL_DOCUMENT_DETAILED_STATUSES = Object.values(DOCUMENT_DETAILED_STATUSES);

const DOCUMENT_DETAILED_TO_LEGACY_STATUS = Object.freeze({
  missing: "pending",
  uploaded: "pending",
  "under-review": "pending",
  approved: "verified",
  rejected: "rejected",
  "needs-revision": "pending",
  "needs-translation": "pending",
  expired: "pending",
});

module.exports = {
  ROLES,
  ALL_ROLES,
  EMPLOYEE_ROLES,
  ALL_EMPLOYEE_ROLES,
  JOURNEY_STAGES,
  ALL_JOURNEY_STAGES,
  LEGACY_APPLICATION_STAGES,
  JOURNEY_STAGE_TO_LEGACY_STAGE,
  APPLICATION_DETAILED_STATUSES,
  ALL_APPLICATION_DETAILED_STATUSES,
  APPLICATION_DETAILED_TO_LEGACY_STATUS,
  DOCUMENT_DETAILED_STATUSES,
  ALL_DOCUMENT_DETAILED_STATUSES,
  DOCUMENT_DETAILED_TO_LEGACY_STATUS,
};
