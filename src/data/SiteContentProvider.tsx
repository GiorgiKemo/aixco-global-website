import { useEffect, useState, type ReactNode } from "react";
import { fetchSiteContent, siteContentDefaults, type SiteContent } from "@/lib/backend/site-content";
import { SiteContentContext } from "@/data/site-content-context";

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(siteContentDefaults);

  useEffect(() => {
    let mounted = true;

    void fetchSiteContent().then((result) => {
      if (mounted) {
        setContent(result.content);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}
