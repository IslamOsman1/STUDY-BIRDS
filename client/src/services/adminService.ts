import { api } from "../lib/api";
import type { AdminOverview, Application, Country, ExhibitionArticle, Faq, OurService, Recognition, SiteSettings, StudyField, Testimonial, User } from "../types";

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
  getRecognitions: async () => {
    const { data } = await api.get<Recognition[]>("/admin/recognitions");
    return data;
  },
  getOurServices: async () => {
    const { data } = await api.get<OurService[]>("/admin/our-services");
    return data;
  },
  getFaqs: async () => {
    const { data } = await api.get<Faq[]>("/admin/faqs");
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
  createRecognition: async (payload: Partial<Recognition>) => {
    const { data } = await api.post<Recognition>("/admin/recognitions", payload);
    return data;
  },
  createOurService: async (payload: Partial<OurService>) => {
    const { data } = await api.post<OurService>("/admin/our-services", payload);
    return data;
  },
  createFaq: async (payload: Partial<Faq>) => {
    const { data } = await api.post<Faq>("/admin/faqs", payload);
    return data;
  },
  createExhibition: async (payload: Partial<ExhibitionArticle>) => {
    const { data } = await api.post<ExhibitionArticle>("/admin/exhibitions", payload);
    return data;
  },
  uploadExhibitionImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<{ url: string }>("/admin/exhibitions/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  },
  updateTestimonial: async (id: string, payload: Partial<Testimonial>) => {
    const { data } = await api.put<Testimonial>(`/admin/testimonials/${id}`, payload);
    return data;
  },
  uploadRecognitionImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<{ url: string }>("/admin/recognitions/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  },
  updateRecognition: async (id: string, payload: Partial<Recognition>) => {
    const { data } = await api.put<Recognition>(`/admin/recognitions/${id}`, payload);
    return data;
  },
  uploadOurServiceImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<{ url: string }>("/admin/our-services/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  },
  updateOurService: async (id: string, payload: Partial<OurService>) => {
    const { data } = await api.put<OurService>(`/admin/our-services/${id}`, payload);
    return data;
  },
  updateFaq: async (id: string, payload: Partial<Faq>) => {
    const { data } = await api.put<Faq>(`/admin/faqs/${id}`, payload);
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
  removeRecognition: async (id: string) => {
    const { data } = await api.delete(`/admin/recognitions/${id}`);
    return data;
  },
  removeOurService: async (id: string) => {
    const { data } = await api.delete(`/admin/our-services/${id}`);
    return data;
  },
  removeFaq: async (id: string) => {
    const { data } = await api.delete(`/admin/faqs/${id}`);
    return data;
  },
  removeExhibition: async (id: string) => {
    const { data } = await api.delete(`/admin/exhibitions/${id}`);
    return data;
  },
};
