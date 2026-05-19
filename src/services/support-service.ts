import apiClient from "@/services/api-client";

export type SupportTopic = "account" | "billing" | "playback" | "bug" | "partnership" | "other";

export interface ContactMessageRequest {
  name: string;
  email: string;
  topic: SupportTopic;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  ticketId: string;
  submittedAt: string;
}

export const supportService = {
  submitContact: (payload: ContactMessageRequest) =>
    apiClient.post<ContactMessageResponse>("/support/contact", payload),
};
