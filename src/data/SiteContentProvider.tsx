import { useEffect, useState, type ReactNode } from "react";
import {
  fetchSiteContent,
  siteContentDefaults,
  type SiteContent,
  type SiteContentResult,
} from "@/lib/backend/site-content";
import { SiteContentContext } from "@/data/site-content-context";
import { scheduleIdleWork } from "@/hooks/use-idle-ready";
import { useI18n } from "@/i18n/I18nProvider";

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
  const { lang } = useI18n();

  useEffect(() => {
    if (initialSource === "supabase" && lang === "en") {
      setContent(initialContent);
      return undefined;
    }

    let mounted = true;

    const cancelIdleWork = scheduleIdleWork(() => {
      void fetchSiteContent(lang).then((result) => {
        if (mounted && result.source === "supabase") {
          setContent(result.content);
        }
      });
    });

    return () => {
      mounted = false;
      cancelIdleWork();
    };
  }, [initialContent, initialSource, lang]);

  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}
