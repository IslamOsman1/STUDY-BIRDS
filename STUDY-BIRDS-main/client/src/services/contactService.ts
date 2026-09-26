import { api } from "../lib/api";

export type ContactMessagePayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export const contactService = {
  sendMessage: async (payload: ContactMessagePayload) => {
    const { data } = await api.post<{ message: string }>("/content/contact-messages", payload);
    return data;
  },
};
