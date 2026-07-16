import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete admin invitation | AIXCO",
  referrer: "no-referrer",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

export default function AdminAuthCompleteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
