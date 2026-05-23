import { api } from "../lib/api";
import type {
  Country,
  EventRegistration,
  ExhibitionArticle,
  Faq,
  PastEvent,
  NotificationItem,
  OurService,
  OurStory,
  Recognition,
  SiteSettings,
  StudyField,
  Testimonial,
  UpcomingEvent,
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
  getRecognitionBySlug: async (slug: string) => {
    const { data } = await api.get<Recognition>(`/content/recognitions/${slug}`);
    return data;
  },
  getOurServices: async () => {
    const { data } = await api.get<OurService[]>("/content/our-services");
    return data;
  },
  getOurServiceBySlug: async (slug: string) => {
    const { data } = await api.get<OurService>(`/content/our-services/${slug}`);
    return data;
  },
  getOurStory: async () => {
    const { data } = await api.get<OurStory>("/content/our-story");
    return data;
  },
  getUpcomingEvent: async () => {
    const { data } = await api.get<UpcomingEvent>("/content/upcoming-event");
    return data;
  },
  getPastEvents: async () => {
    const { data } = await api.get<PastEvent[]>("/content/past-events");
    return data;
  },
  registerForEvent: async (payload: Omit<EventRegistration, "_id" | "createdAt" | "upcomingEvent">) => {
    const { data } = await api.post<{ message: string; registration: EventRegistration }>("/content/event-registrations", payload);
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
  getExhibitionArticleBySlug: async (slug: string) => {
    const { data } = await api.get<ExhibitionArticle>(`/content/exhibitions/${slug}`);
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
