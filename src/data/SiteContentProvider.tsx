import { useEffect, useState, type ReactNode } from "react";
import { fetchSiteContent, siteContentDefaults, type SiteContent } from "@/lib/backend/site-content";
import { SiteContentContext } from "@/data/site-content-context";
import { scheduleIdleWork } from "@/hooks/use-idle-ready";

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(siteContentDefaults);

  useEffect(() => {
    let mounted = true;

    const cancelIdleWork = scheduleIdleWork(() => {
      void fetchSiteContent().then((result) => {
        if (mounted && result.source === "supabase") {
          setContent(result.content);
        }
      });
    });

    return () => {
      mounted = false;
      cancelIdleWork();
    };
  }, []);

  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}
