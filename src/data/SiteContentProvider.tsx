import { useEffect, useState, type ReactNode } from "react";
import {
  fetchSiteContent,
  siteContentDefaults,
  type SiteContent,
  type SiteContentResult,
} from "@/lib/backend/site-content";
import { SiteContentContext } from "@/data/site-content-context";
import { scheduleIdleWork } from "@/hooks/use-idle-ready";

type SiteContentProviderProps = {
  children: ReactNode;
  initialContent?: SiteContent;
  initialSource?: SiteContentResult["source"];
};

export function SiteContentProvider({
  children,
  initialContent = siteContentDefaults,
  initialSource = "fallback",
}: SiteContentProviderProps) {
  const [content, setContent] = useState<SiteContent>(initialContent);

  useEffect(() => {
    if (initialSource === "supabase") {
      return undefined;
    }

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
  }, [initialSource]);

  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}
