import { api } from "../lib/api";
import type { Application } from "../types";

export const universityPortalService = {
  getApplications: async (status?: string) => {
    const { data } = await api.get<Application[]>("/university-portal/applications", {
      params: status ? { status } : undefined,
    });
    return data;
  },
  getApplicationById: async (id: string) => {
    const { data } = await api.get<Application>(`/university-portal/applications/${id}`);
    return data;
  },
  updateApplicationStatus: async (id: string, payload: { detailedStatus: string; note?: string }) => {
    const { data } = await api.patch<Application>(`/university-portal/applications/${id}/status`, payload);
    return data;
  },
  requestDocument: async (id: string, payload: { documentType?: string; reason?: string }) => {
    const { data } = await api.post<{ message: string }>(
      `/university-portal/applications/${id}/request-document`,
      payload
    );
    return data;
  },
};
