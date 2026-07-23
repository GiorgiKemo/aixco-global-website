"use client";

import { useSyncExternalStore } from "react";

const DOWNLOAD_ACCESS_STORAGE_KEY = "aixco-download-access-v1";
const DOWNLOAD_ACCESS_GRANTED_VALUE = "granted";
const DOWNLOAD_ACCESS_EVENT = "aixco:download-access-changed";

export function hasDownloadAccess() {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(DOWNLOAD_ACCESS_STORAGE_KEY) === DOWNLOAD_ACCESS_GRANTED_VALUE;
  } catch {
    return false;
  }
}

export function grantDownloadAccess() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(DOWNLOAD_ACCESS_STORAGE_KEY, DOWNLOAD_ACCESS_GRANTED_VALUE);
  } catch {
    return;
  }

  window.dispatchEvent(new Event(DOWNLOAD_ACCESS_EVENT));
}

function subscribeToDownloadAccess(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === DOWNLOAD_ACCESS_STORAGE_KEY) onStoreChange();
  };
  const handleAccessChange = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(DOWNLOAD_ACCESS_EVENT, handleAccessChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(DOWNLOAD_ACCESS_EVENT, handleAccessChange);
  };
}

export function useDownloadAccess() {
  return useSyncExternalStore(subscribeToDownloadAccess, hasDownloadAccess, () => false);
}

export function resetDownloadAccessForTests() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DOWNLOAD_ACCESS_STORAGE_KEY);
  window.dispatchEvent(new Event(DOWNLOAD_ACCESS_EVENT));
}
