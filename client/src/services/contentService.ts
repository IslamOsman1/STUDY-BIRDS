import { api } from "../lib/api";
import type {
  Country,
  ExhibitionArticle,
  NotificationItem,
  SiteSettings,
  StudyField,
  Testimonial,
} from "../types";

export const contentService = {
  getCountries: async () => {
    const { data } = await api.get<Country[]>("/content/countries");
    return data;
  },
  getTestimonials: async () => {
    const { data } = await api.get<Testimonial[]>("/content/testimonials");
    return data;
  },
  getExhibitionArticles: async () => {
    const { data } = await api.get<ExhibitionArticle[]>("/content/exhibitions");
    return data;
  },
  getSiteSettings: async () => {
    const { data } = await api.get<SiteSettings>("/content/site-settings");
    return data;
  },
  getStudyFields: async () => {
    const { data } = await api.get<StudyField[]>("/content/study-fields");
    return data;
  },
  getNotifications: async () => {
    const { data } = await api.get<NotificationItem[]>("/content/notifications");
    return data;
  },
};
