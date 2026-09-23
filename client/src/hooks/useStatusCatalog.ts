import { useEffect, useState } from "react";
import { api } from "../lib/api";

// reasonMeaning / expiredMeaning only appear in catalog entries (templates).
export type StatusCopy = { label: string; meaning: string; nextStep: string; reasonMeaning?: string; expiredMeaning?: string };
export type StatusInfo = {
  status: string; code: string; tone: "neutral" | "info" | "action" | "success" | "danger";
  ar: StatusCopy; en: StatusCopy; reason?: string | null;
};
type CatalogEntry = { code: string; tone: StatusInfo["tone"]; ar: StatusCopy; en: StatusCopy };
export type StatusCatalog = { applications: Record<string, CatalogEntry>; documents: Record<string, CatalogEntry> };

// Served by the API (server/src/constants/statusCatalog.js) so every client
// shows the same wording; fetched once per page load.
let cached: Promise<StatusCatalog> | null = null;

export const useStatusCatalog = () => {
  const [catalog, setCatalog] = useState<StatusCatalog | null>(null);
  useEffect(() => {
    cached ||= api.get<StatusCatalog>("/content/status-catalog").then((response) => response.data);
    let active = true;
    cached.then((value) => { if (active) setCatalog(value); }).catch(() => { cached = null; });
    return () => { active = false; };
  }, []);
  return catalog;
};
