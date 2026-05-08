import { createContext, useContext } from "react";
import { siteContentDefaults, type SiteContent } from "@/lib/backend/site-content";

export const SiteContentContext = createContext<SiteContent>(siteContentDefaults);

export function useSiteContent() {
  return useContext(SiteContentContext);
}
