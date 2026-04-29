import { api } from "../lib/api";
import type { ApplicantProfileSnapshot, Application } from "../types";

export const applicationService = {
  create: async (payload: { programId: string; notes?: string; documentIds?: string[]; applicantProfile?: ApplicantProfileSnapshot }) => {
    const { data } = await api.post<Application>("/applications", payload);
    return data;
  },
  getAll: async () => {
    const { data } = await api.get<Application[]>("/applications");
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<Application>(`/applications/${id}`);
    return data;
  },
  updateStatus: async (id: string, payload: { status: string; note?: string }) => {
    const { data } = await api.put<Application>(`/applications/${id}/status`, payload);
    return data;
  },
};
