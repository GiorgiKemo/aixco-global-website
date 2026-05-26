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
      "In Dubai, AIXCO executed large-scale residential and mixed-use projects including Eden House and Dubai Healthcare City. This chapter is part of our legacy portfolio—we are not opening new Dubai investments at this time.",
    stats: [
      { value: "600+", label: "Units delivered (Eden House)" },
      { value: "USD 462m", label: "Eden House development value" },
      { value: "Legacy", label: "Market status" },
    ],
    status: "legacy",
  },
  {
    id: "batumi",
    eyebrow: "Batumi · Current opportunity",
    title: "Opportunity-driven focus in Georgia",
    highlight: "Buy apartments from €50,000",
    body:
      "Today, AIXCO is focused on Batumi—helping buyers purchase apartments, supporting brokers, and administering property with transparent euro pricing. Entry typically starts from €10,000, with 10% reservation options on selected units from €50,000.",
    stats: [
      { value: "€50K+", label: "Apartment pricing" },
      { value: "8%+", label: "Net rental yields" },
      { value: "Now", label: "Active market" },
    ],
    status: "current",
  },
];
