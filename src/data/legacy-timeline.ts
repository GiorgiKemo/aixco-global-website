export type LegacyTimelineChapter = {
  id: string;
  eyebrow: string;
  title: string;
  highlight: string;
  body: string;
  stats: Array<{ value: string; label: string }>;
  link?: { label: string; href: string };
  status: "legacy" | "current";
};

export const legacyTimelineChapters: LegacyTimelineChapter[] = [
  {
    id: "switzerland",
    eyebrow: "Switzerland · Legacy",
    title: "Swiss real estate heritage",
    highlight: "CHF 1.1 billion",
    body:
      "AIXCO’s roots trace to Switzerland, where the group built a substantial residential and commercial real estate track record. This legacy foundation shaped our discipline around asset quality, documentation, and long-term ownership.",
    stats: [
      { value: "CHF 1.1B", label: "Real estate activity" },
      { value: "2009", label: "Group origins" },
      { value: "Swiss", label: "Market heritage" },
    ],
    link: { label: "Explore Swiss heritage at x-co-group.com", href: "https://x-co-group.com" },
    status: "legacy",
  },
  {
    id: "dubai",
    eyebrow: "Dubai · Legacy portfolio",
    title: "Gulf developments delivered",
    highlight: "USD 800m+ development volume",
    body:
      "In Dubai, AIXCO executed large-scale residential and mixed-use projects including Eden House and Dubai Healthcare City. This chapter is part of our legacy portfolio—we are not opening new Dubai real estate offers at this time.",
    stats: [
      { value: "600+", label: "Units delivered (Eden House)" },
      { value: "USD 462m", label: "Eden House development value" },
      { value: "Legacy", label: "Market status" },
    ],
    status: "legacy",
  },
  {
    id: "batumi",
    eyebrow: "Emerging market opportunity",
    title: "Current focus in Georgia",
    highlight: "Selected apartments from €45,000",
    body:
      "Today, Batumi is AIXCO's current selected emerging-market focus, with exclusive project access, 100% foreign ownership, no residency permit requirement, bank financing minimum 60% of property value, and an ISO-certified transparency process.",
    stats: [
      { value: "€45K+", label: "Entry from" },
      { value: "60%", label: "Bank financing" },
      { value: "10-12%", label: "Approx. net rental yields" },
    ],
    status: "current",
  },
];
