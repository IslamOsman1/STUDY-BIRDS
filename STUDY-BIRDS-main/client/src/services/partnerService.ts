import { api } from "../lib/api";
import type {
  ActivityLogItem,
  AgentStudentItem,
  KnowledgeBaseItem,
  MarketingAssetItem,
  NotificationItem,
  PartnerOverview,
  PayoutRequestItem,
  ReferralSummary,
  StudentProfile,
  SupportTicketItem,
  VerificationDocumentItem,
  VerificationOverview,
  AgentWalletEntry,
} from "../types";

export const partnerService = {
  getOverview: async () => {
    const { data } = await api.get<PartnerOverview>("/partners/overview");
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get<StudentProfile>("/partners/profile");
    return data;
  },
  updateProfile: async (payload: Partial<StudentProfile> & { name?: string; email?: string }) => {
    const { data } = await api.put<StudentProfile>("/partners/profile", payload);
    return data;
  },
  getStudents: async () => {
    const { data } = await api.get<AgentStudentItem[]>("/partners/students");
    return data;
  },
  createStudent: async (payload: Partial<AgentStudentItem>) => {
    const { data } = await api.post<AgentStudentItem>("/partners/students", payload);
    return data;
  },
  updateStudent: async (studentId: string, payload: Partial<AgentStudentItem>) => {
    const { data } = await api.put<AgentStudentItem>(`/partners/students/${studentId}`, payload);
    return data;
  },
  removeStudent: async (studentId: string) => {
    const { data } = await api.delete<{ message: string }>(`/partners/students/${studentId}`);
    return data;
  },
  uploadStudentDocument: async (studentId: string, file: File, label: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("label", label);
    const { data } = await api.post<AgentStudentItem>(`/partners/students/${studentId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  getWallet: async () => {
    const { data } = await api.get<{
      summary: {
        availableBalance: number;
        pendingBalance: number;
        receivedBalance: number;
      };
      entries: AgentWalletEntry[];
      payouts: PayoutRequestItem[];
    }>("/partners/wallet");
    return data;
  },
  requestPayout: async (payload: { amount: number; method: string; payoutDetails: string; notes?: string }) => {
    const { data } = await api.post<PayoutRequestItem>("/partners/wallet/payout-requests", payload);
    return data;
  },
  getReferral: async () => {
    const { data } = await api.get<ReferralSummary>("/partners/referral");
    return data;
  },
  getMarketingAssets: async () => {
    const { data } = await api.get<MarketingAssetItem[]>("/partners/marketing-assets");
    return data;
  },
  getVerification: async () => {
    const { data } = await api.get<VerificationOverview>("/partners/verification");
    return data;
  },
  uploadVerificationDocument: async (file: File, type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const { data } = await api.post<VerificationDocumentItem>("/partners/verification/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  getTickets: async () => {
    const { data } = await api.get<SupportTicketItem[]>("/partners/tickets");
    return data;
  },
  createTicket: async (payload: { subject: string; message: string; category: string; file?: File | null }) => {
    const formData = new FormData();
    formData.append("subject", payload.subject);
    formData.append("message", payload.message);
    formData.append("category", payload.category);
    if (payload.file) {
      formData.append("file", payload.file);
    }
    const { data } = await api.post<SupportTicketItem>("/partners/tickets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  getNotifications: async () => {
    const { data } = await api.get<NotificationItem[]>("/partners/notifications");
    return data;
  },
  markNotificationRead: async (id: string) => {
    const { data } = await api.patch<NotificationItem>(`/partners/notifications/${id}/read`);
    return data;
  },
  getActivityLog: async () => {
    const { data } = await api.get<ActivityLogItem[]>("/partners/activity-log");
    return data;
  },
  getKnowledgeBase: async () => {
    const { data } = await api.get<KnowledgeBaseItem[]>("/partners/knowledge-base");
    return data;
  },
};
