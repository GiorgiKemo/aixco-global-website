import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTeamMemberRotation } from "./use-team-member-rotation";

vi.mock("@/hooks/use-hydrated-reduced-motion", () => ({
  useHydratedReducedMotion: () => false,
}));

describe("useTeamMemberRotation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts on the first member and cycles when active", () => {
    const { result } = renderHook(() =>
      useTeamMemberRotation({ memberCount: 3, isActive: true, intervalMs: 4000 }),
    );

    expect(result.current.activeIndex).toBe(0);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.activeIndex).toBe(1);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.activeIndex).toBe(2);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.activeIndex).toBe(0);
  });

  it("pauses auto-rotation after manual selection and resumes after delay", () => {
    const { result } = renderHook(() =>
      useTeamMemberRotation({
        memberCount: 3,
        isActive: true,
        intervalMs: 4000,
        resumeDelayMs: 5000,
      }),
    );

    act(() => {
      result.current.selectMember(2);
    });
    expect(result.current.activeIndex).toBe(2);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.activeIndex).toBe(2);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.activeIndex).toBe(0);
  });

  it("switches immediately for hover preview and stays paused until resumed", () => {
    const { result } = renderHook(() =>
      useTeamMemberRotation({
        memberCount: 3,
        isActive: true,
        intervalMs: 4000,
        resumeDelayMs: 5000,
      }),
    );

    act(() => {
      result.current.previewMember(1);
    });
    expect(result.current.activeIndex).toBe(1);

    act(() => {
      vi.advanceTimersByTime(9000);
    });
    expect(result.current.activeIndex).toBe(1);

    act(() => {
      result.current.resumeRotation();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.activeIndex).toBe(2);
  });

  it("resets to the first member when the section becomes inactive", () => {
    const { result, rerender } = renderHook(
      ({ isActive }) => useTeamMemberRotation({ memberCount: 3, isActive, intervalMs: 4000 }),
      { initialProps: { isActive: true } },
    );

    act(() => {
      result.current.selectMember(2);
    });
    expect(result.current.activeIndex).toBe(2);

    rerender({ isActive: false });
    expect(result.current.activeIndex).toBe(0);
  });
});
