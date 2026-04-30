import { api } from "../lib/api";
import type { AdminOverview, Application, Country, ExhibitionArticle, SiteSettings, StudyField, Testimonial, User } from "../types";

export const adminService = {
  getOverview: async () => {
    const { data } = await api.get<AdminOverview>("/admin/overview");
    return data;
  },
  getStats: async () => {
    const { data } = await api.get<{ students: number; universities: number; programs: number; applications: number }>("/admin/stats");
    return data;
  },
  getStudents: async () => {
    const { data } = await api.get<User[]>("/admin/students");
    return data;
  },
  getUsers: async () => {
    const { data } = await api.get<User[]>("/admin/users");
    return data;
  },
  updateUser: async (id: string, payload: Partial<User>) => {
    const { data } = await api.patch<User>(`/admin/users/${id}`, payload);
    return data;
  },
  getApplications: async () => {
    const { data } = await api.get<Application[]>("/admin/applications");
    return data;
  },
  getCountries: async () => {
    const { data } = await api.get<Country[]>("/admin/countries");
    return data;
  },
  getSiteSettings: async () => {
    const { data } = await api.get<SiteSettings>("/admin/site-settings");
    return data;
  },
  getStudyFields: async () => {
    const { data } = await api.get<StudyField[]>("/admin/study-fields");
    return data;
  },
  createCountry: async (payload: Partial<Country>) => {
    const { data } = await api.post<Country>("/admin/countries", payload);
    return data;
  },
  uploadCountryImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<{ url: string }>("/admin/countries/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  },
  updateCountry: async (id: string, payload: Partial<Country>) => {
    const { data } = await api.put<Country>(`/admin/countries/${id}`, payload);
    return data;
  },
  updateSiteSettings: async (payload: Partial<SiteSettings>) => {
    const { data } = await api.put<SiteSettings>("/admin/site-settings", payload);
    return data;
  },
  createStudyField: async (payload: Partial<StudyField>) => {
    const { data } = await api.post<StudyField>("/admin/study-fields", payload);
    return data;
  },
  uploadStudyFieldImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<{ url: string }>("/admin/study-fields/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  },
  updateStudyField: async (id: string, payload: Partial<StudyField>) => {
    const { data } = await api.put<StudyField>(`/admin/study-fields/${id}`, payload);
    return data;
  },
  removeStudyField: async (id: string) => {
    const { data } = await api.delete(`/admin/study-fields/${id}`);
    return data;
  },
  removeCountry: async (id: string) => {
    const { data } = await api.delete(`/admin/countries/${id}`);
    return data;
  },
  getTestimonials: async () => {
    const { data } = await api.get<Testimonial[]>("/admin/testimonials");
    return data;
  },
  getExhibitions: async () => {
    const { data } = await api.get<ExhibitionArticle[]>("/admin/exhibitions");
    return data;
  },
  createTestimonial: async (payload: Partial<Testimonial>) => {
    const { data } = await api.post<Testimonial>("/admin/testimonials", payload);
    return data;
  },
  createExhibition: async (payload: Partial<ExhibitionArticle>) => {
    const { data } = await api.post<ExhibitionArticle>("/admin/exhibitions", payload);
    return data;
  },
  updateTestimonial: async (id: string, payload: Partial<Testimonial>) => {
    const { data } = await api.put<Testimonial>(`/admin/testimonials/${id}`, payload);
    return data;
  },
  updateExhibition: async (id: string, payload: Partial<ExhibitionArticle>) => {
    const { data } = await api.put<ExhibitionArticle>(`/admin/exhibitions/${id}`, payload);
    return data;
  },
  removeTestimonial: async (id: string) => {
    const { data } = await api.delete(`/admin/testimonials/${id}`);
    return data;
  },
  removeExhibition: async (id: string) => {
    const { data } = await api.delete(`/admin/exhibitions/${id}`);
    return data;
  },
};
