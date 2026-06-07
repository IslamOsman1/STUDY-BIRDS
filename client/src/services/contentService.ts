import { api } from "../lib/api";
import type {
  Country,
  EventRegistration,
  ExhibitionArticle,
  Faq,
  HomePageContent,
  NotificationItem,
  OurService,
  OurStory,
  PaginatedResponse,
  PastEvent,
  Recognition,
  SiteSettings,
  StudyField,
  Testimonial,
  UpcomingEvent,
} from "../types";

const responseCache = new Map<string, Promise<unknown>>();

const withCache = <T>(key: string, loader: () => Promise<T>, ttlMs = 60_000) => {
  const cached = responseCache.get(key) as Promise<T> | undefined;
  if (cached) {
    return cached;
  }

  const request = loader()
    .then((result) => {
      globalThis.setTimeout(() => {
        responseCache.delete(key);
      }, ttlMs);
      return result;
    })
    .catch((error) => {
      responseCache.delete(key);
      throw error;
    });

  responseCache.set(key, request);
  return request;
};

type ListParams = {
  page?: number;
  limit?: number;
  featuredOnly?: boolean;
  paginate?: boolean;
};

const buildParams = (params?: ListParams) => params;

export const contentService = {
  getHomePageContent: async () =>
    withCache("content:home", async () => {
      const { data } = await api.get<HomePageContent>("/content/home");
      return data;
    }),
  getCountries: async (params?: ListParams) => {
    const { data } = await api.get<Country[] | PaginatedResponse<Country>>("/content/countries", {
      params: buildParams(params),
    });
    return data;
  },
  getTestimonials: async (params?: ListParams) => {
    const { data } = await api.get<Testimonial[] | PaginatedResponse<Testimonial>>("/content/testimonials", {
      params: buildParams(params),
    });
    return data;
  },
  getRecognitions: async (params?: ListParams) => {
    const { data } = await api.get<Recognition[] | PaginatedResponse<Recognition>>("/content/recognitions", {
      params: buildParams(params),
    });
    return data;
  },
  getRecognitionBySlug: async (slug: string) => {
    const { data } = await api.get<Recognition>(`/content/recognitions/${slug}`);
    return data;
  },
  getOurServices: async (params?: ListParams) => {
    const { data } = await api.get<OurService[] | PaginatedResponse<OurService>>("/content/our-services", {
      params: buildParams(params),
    });
    return data;
  },
  getOurServiceBySlug: async (slug: string) => {
    const { data } = await api.get<OurService>(`/content/our-services/${slug}`);
    return data;
  },
  getOurStory: async () =>
    withCache("content:our-story", async () => {
      const { data } = await api.get<OurStory>("/content/our-story");
      return data;
    }),
  getUpcomingEvent: async () =>
    withCache("content:upcoming-event", async () => {
      const { data } = await api.get<UpcomingEvent>("/content/upcoming-event");
      return data;
    }),
  getPastEvents: async (params?: ListParams) => {
    const { data } = await api.get<PastEvent[] | PaginatedResponse<PastEvent>>("/content/past-events", {
      params: buildParams(params),
    });
    return data;
  },
  registerForEvent: async (payload: Omit<EventRegistration, "_id" | "createdAt" | "upcomingEvent">) => {
    const { data } = await api.post<{ message: string; registration: EventRegistration }>("/content/event-registrations", payload);
    return data;
  },
  getFaqs: async (params?: ListParams) => {
    const { data } = await api.get<Faq[] | PaginatedResponse<Faq>>("/content/faqs", {
      params: buildParams(params),
    });
    return data;
  },
  getExhibitionArticles: async (params?: ListParams) => {
    const { data } = await api.get<ExhibitionArticle[] | PaginatedResponse<ExhibitionArticle>>("/content/blog", {
      params: buildParams(params),
    });
    return data;
  },
  getExhibitionArticleBySlug: async (slug: string) => {
    const { data } = await api.get<ExhibitionArticle>(`/content/blog/${slug}`);
    return data;
  },
  getBlogCategories: async () =>
    withCache("content:blog-categories", async () => {
      const { data } = await api.get<string[]>("/content/blog/categories");
      return data;
    }),
  getSiteSettings: async () =>
    withCache("content:site-settings", async () => {
      const { data } = await api.get<SiteSettings>("/content/site-settings");
      return data;
    }, 300_000),
  getStudyFields: async (params?: ListParams) => {
    const { data } = await api.get<StudyField[] | PaginatedResponse<StudyField>>("/content/study-fields", {
      params: buildParams(params),
    });
    return data;
  },
  getNotifications: async () => {
    const { data } = await api.get<NotificationItem[]>("/content/notifications");
    return data;
  },
};
