import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDelayedIdleReady } from "./use-idle-ready";

describe("useDelayedIdleReady", () => {
  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(window, "requestIdleCallback");
    Reflect.deleteProperty(window, "cancelIdleCallback");
  });

  it("waits for the configured delay before scheduling idle readiness", () => {
    vi.useFakeTimers();
    const requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
      const handle = window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 0);
      return handle;
    });

    Object.defineProperty(window, "requestIdleCallback", {
      configurable: true,
      value: requestIdleCallback,
    });

    const { result } = renderHook(() => useDelayedIdleReady(250, 500));

    expect(result.current).toBe(false);
    expect(requestIdleCallback).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(249));
    expect(requestIdleCallback).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(requestIdleCallback).toHaveBeenCalledWith(expect.any(Function), { timeout: 500 });

    act(() => vi.runOnlyPendingTimers());
    expect(result.current).toBe(true);
  });

  it("cancels the pending startup delay when unmounted", () => {
    vi.useFakeTimers();
    const requestIdleCallback = vi.fn();
    Object.defineProperty(window, "requestIdleCallback", {
      configurable: true,
      value: requestIdleCallback,
    });

    const { unmount } = renderHook(() => useDelayedIdleReady(250, 500));

    unmount();
    act(() => vi.advanceTimersByTime(250));

    expect(requestIdleCallback).not.toHaveBeenCalled();
  });
});
