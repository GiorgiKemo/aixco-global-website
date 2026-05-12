const MOTION_REDUCED_MOTION_WARNING_URL = "https://motion.dev/troubleshooting/reduced-motion-disabled";
let hasInstalledMotionReducedMotionWarningFilter = false;

export type ReducedMotionPreference = "always" | "never" | "user";

export function getReducedMotionPreference(
  nodeEnv = process.env.NODE_ENV,
): ReducedMotionPreference {
  return nodeEnv === "production" ? "user" : "never";
}

export function isMotionReducedMotionDevWarning(value: unknown) {
  return typeof value === "string" && value.includes(MOTION_REDUCED_MOTION_WARNING_URL);
}

export function installMotionReducedMotionDevWarningFilter(nodeEnv = process.env.NODE_ENV) {
  if (
    nodeEnv === "production" ||
    hasInstalledMotionReducedMotionWarningFilter ||
    typeof console === "undefined"
  ) {
    return;
  }

  const originalWarn = console.warn.bind(console);

  console.warn = (...args: unknown[]) => {
    if (args.some(isMotionReducedMotionDevWarning)) return;
    originalWarn(...args);
  };

  hasInstalledMotionReducedMotionWarningFilter = true;
}
