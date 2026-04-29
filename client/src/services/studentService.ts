import { api } from "../lib/api";
import type { Application, DocumentItem, StudentProfile } from "../types";

export const studentService = {
  getProfile: async () => {
    const { data } = await api.get<StudentProfile>("/students/profile");
    return data;
  },
  updateProfile: async (payload: Partial<StudentProfile> & { name?: string; email?: string }) => {
    const { data } = await api.put<StudentProfile>("/students/profile", payload);
    return data;
  },
  uploadDocument: async (file: File, type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const { data } = await api.post<DocumentItem>("/students/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  getDocuments: async () => {
    const { data } = await api.get<DocumentItem[]>("/students/documents");
    return data;
  },
  getApplications: async () => {
    const { data } = await api.get<Application[]>("/students/applications");
    return data;
  },
};
