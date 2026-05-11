import { api } from "../lib/api";
import type {
  Country,
  ExhibitionArticle,
  Faq,
  NotificationItem,
  OurService,
  Recognition,
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
  getRecognitions: async () => {
    const { data } = await api.get<Recognition[]>("/content/recognitions");
    return data;
  },
  getOurServices: async () => {
    const { data } = await api.get<OurService[]>("/content/our-services");
    return data;
  },
  getFaqs: async () => {
    const { data } = await api.get<Faq[]>("/content/faqs");
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
