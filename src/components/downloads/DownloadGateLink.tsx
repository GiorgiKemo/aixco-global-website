"use client";

import type { MouseEvent, ReactNode } from "react";
import { useUI } from "@/components/ui-state";
import { hasDownloadAccess, useDownloadAccess } from "@/lib/download-access";
import { getSafePublicAssetHref } from "@/lib/security/urls";

type DownloadGateLinkProps = {
  href: string;
  fileName: string;
  lockedHref?: string;
  className?: string;
  ariaLabel?: string;
  dataAttributes?: Record<string, string>;
  children: ReactNode;
};

export function DownloadGateLink({
  href,
  fileName,
  lockedHref = "#materials",
  className,
  ariaLabel,
  dataAttributes,
  children,
}: DownloadGateLinkProps) {
  const { openContact } = useUI();
  const isUnlocked = useDownloadAccess();
  const safeHref = getSafePublicAssetHref(href, lockedHref);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (hasDownloadAccess()) return;

    event.preventDefault();
    openContact({
      kind: "download",
      downloadHref: safeHref,
      downloadFileName: fileName,
    });
  };

  return (
    <a
      href={isUnlocked ? safeHref : lockedHref}
      download={isUnlocked ? fileName : undefined}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-haspopup={isUnlocked ? undefined : "dialog"}
      className={className}
      {...dataAttributes}
    >
      {children}
    </a>
  );
}
