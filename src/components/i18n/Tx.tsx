"use client";

import { useI18n } from "@/i18n/I18nProvider";

export function Tx({ children }: { children: string }) {
  const { tx } = useI18n();

  return <>{tx(children)}</>;
}
