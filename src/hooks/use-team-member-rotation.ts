import { useCallback, useEffect, useRef, useState } from "react";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";

const DEFAULT_INTERVAL_MS = 4500;
const DEFAULT_RESUME_DELAY_MS = 8000;

type UseTeamMemberRotationOptions = {
  memberCount: number;
  isActive: boolean;
  intervalMs?: number;
  resumeDelayMs?: number;
};

export function useTeamMemberRotation({
  memberCount,
  isActive,
  intervalMs = DEFAULT_INTERVAL_MS,
  resumeDelayMs = DEFAULT_RESUME_DELAY_MS,
}: UseTeamMemberRotationOptions) {
  const shouldReduceMotion = useHydratedReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResumeTimeout = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const scheduleResume = useCallback(() => {
    clearResumeTimeout();
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      resumeTimeoutRef.current = null;
    }, resumeDelayMs);
  }, [clearResumeTimeout, resumeDelayMs]);

  const selectMember = useCallback(
    (index: number) => {
      setActiveIndex(index);
      setIsPaused(true);
      scheduleResume();
    },
    [scheduleResume],
  );

  const previewMember = useCallback(
    (index: number) => {
      setActiveIndex(index);
      setIsPaused(true);
      clearResumeTimeout();
    },
    [clearResumeTimeout],
  );

  const pauseRotation = useCallback(() => {
    setIsPaused(true);
    clearResumeTimeout();
  }, [clearResumeTimeout]);

  const resumeRotation = useCallback(() => {
    scheduleResume();
  }, [scheduleResume]);

  useEffect(() => {
    if (!isActive) {
      setActiveIndex(0);
      setIsPaused(false);
      clearResumeTimeout();
    }
  }, [clearResumeTimeout, isActive]);

  useEffect(() => {
    if (!isActive || isPaused || shouldReduceMotion || memberCount <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % memberCount);
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [intervalMs, isActive, isPaused, memberCount, shouldReduceMotion]);

  useEffect(() => () => clearResumeTimeout(), [clearResumeTimeout]);

  return {
    activeIndex,
    selectMember,
    previewMember,
    pauseRotation,
    resumeRotation,
  };
}
