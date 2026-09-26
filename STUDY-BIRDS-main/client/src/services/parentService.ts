import { api } from "../lib/api";
import type { ParentLinkItem, ParentChildOverview, User, PaymentProofItem } from "../types";

export const parentService = {
  getLinkRequests: async () => {
    const { data } = await api.get<ParentLinkItem[]>("/parents/link-requests");
    return data;
  },
  createLinkRequest: async (payload: { studentEmail: string; relationship?: string; note?: string }) => {
    const { data } = await api.post<ParentLinkItem>("/parents/link-requests", payload);
    return data;
  },
  getChildren: async () => {
    const { data } = await api.get<User[]>("/parents/children");
    return data;
  },
  getChildOverview: async (studentId: string) => {
    const { data } = await api.get<ParentChildOverview>(`/parents/children/${studentId}/overview`);
    return data;
  },
  getChildPayments: async (studentId: string) => {
    const { data } = await api.get<PaymentProofItem[]>(`/parents/children/${studentId}/payments`);
    return data;
  },
};
