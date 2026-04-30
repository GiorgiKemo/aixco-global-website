// Single source of truth for the AIXCO website content.
export const company = {
  name: "AIXCO Global",
  tagline: "Quality Real Estate Participation",
  email: "info@aixco.global",
  address: "Grüngasse 16, 1050 Wien, Austria",
  founded: 2009,
  offices: ["Vienna", "Dubai", "Batumi"],
  socials: {
    linkedin: "https://www.linkedin.com/company/aixco-global",
    instagram: "https://www.instagram.com/aixco.global",
    youtube: "https://www.youtube.com/@aixco-global",
    x: "https://x.com/aixcoglobal",
  },
  portals: {
    customer: "https://workw.com/aixco",
    broker: "https://workw.com/aixco/broker",
    developer: "https://workw.com/aixco/developer",
  },
};

export const metrics = [
  { value: "5,000+", label: "Trusted clients" },
  { value: "$400M", label: "Gross development value" },
  { value: "500+", label: "Transactions closed" },
  { value: "85+", label: "Employees worldwide" },
  { value: "$4.2B", label: "Capital raised" },
  { value: "$2B", label: "Developments underway" },
  { value: "4.2x", label: "Avg. investment return" },
  { value: "2009", label: "Founded in Vienna" },
];

export const dubaiFunds = [
  {
    id: "fund-1",
    name: "Fund I — Eden House",
    location: "The Canal & The Park, Dubai",
    status: "Live",
    targetReturn: "12–15% IRR",
    horizon: "5 years",
    summary:
      "Branded ultra-prime residences along the Dubai Water Canal, anchored by world-class hospitality and serviced amenities.",
    image: "dubai-eden",
  },
  {
    id: "fund-2",
    name: "Fund II — Healthcare City",
    location: "Dubai Healthcare City",
    status: "Funding",
    targetReturn: "10–13% IRR",
    horizon: "4 years",
    summary:
      "Mixed-use medical and residential development inside the regulated Dubai Healthcare City free zone.",
    image: "dubai-healthcare",
  },
];

export const batumiBenefits = [
  { stat: "8%+", label: "Rental yields", note: "Net of management fees" },
  { stat: "12%", label: "Annual price growth", note: "Up to, prime stock" },
  { stat: "€50K", label: "Entry price", note: "Studios, branded buildings" },
  { stat: "100%", label: "Foreign ownership", note: "No restrictions" },
  { stat: "1%", label: "Rental tax", note: "Up to €180k/year revenue" },
  { stat: "0%", label: "Capital gains", note: "After 2 years of holding" },
  { stat: "60%", label: "LTV financing", note: "International programs" },
];

export const batumiProperties = [
  {
    id: "queens",
    name: "Queens",
    location: "Old Boulevard, Batumi",
    priceFrom: "€68,000",
    yield: "9.1%",
    delivery: "Q4 2025",
    image: "batumi-queens",
    description:
      "An elegant beachfront residence at the heart of the historical boulevard. Branded interiors, private rental program, sea-view balconies.",
  },
  {
    id: "serenade",
    name: "Serenade",
    location: "New Boulevard, Batumi",
    priceFrom: "€54,000",
    yield: "10.2%",
    delivery: "Q2 2026",
    image: "batumi-serenade",
    description:
      "Contemporary architecture by the Black Sea coast. Hotel-grade lobby, rooftop infinity pool, full furniture & rental management.",
  },
];

export const participationRoutes = [
  {
    id: "bond",
    title: "AIXCO 6% Bond",
    coupon: "6.0% p.a.",
    minTicket: "€1,000",
    term: "5 years, fixed coupon",
    bullets: [
      "Fixed annual coupon of 6%, paid yearly",
      "Senior corporate bond issued by AIXCO Global",
      "Diversified across Dubai & Batumi developments",
      "Public ISIN, custodied with European brokers",
    ],
    cta: "Subscribe to the bond",
  },
  {
    id: "apartment",
    title: "Apartment in Batumi",
    coupon: "8–10% net yield",
    minTicket: "€50,000",
    term: "Title ownership, freehold",
    bullets: [
      "Direct title in your name, no fund layer",
      "Fully managed rental program (optional)",
      "Capital gains exemption after 2 years",
      "Financing up to 60% via partner banks",
    ],
    cta: "Explore apartments",
  },
];

export const journeys = [
  {
    role: "Real Estate Buyer",
    summary: "Acquire a branded apartment in Batumi with full advisory.",
    steps: [
      "Register and verify identity",
      "Discovery call with an AIXCO advisor",
      "Curated shortlist matched to your goals",
      "Reservation, due diligence and SPA review",
      "Notarized purchase, financing & furnishing",
      "Hand-over, rental program & quarterly reporting",
    ],
  },
  {
    role: "Bond Buyer",
    summary: "Subscribe to the AIXCO 6% Bond from €1,000.",
    steps: [
      "Register and complete suitability questionnaire",
      "Receive the prospectus and term sheet",
      "Open or link a custody account",
      "Place order via your broker (ISIN-based)",
      "Settlement and electronic confirmation",
      "Annual coupon payments and investor reports",
    ],
  },
  {
    role: "Broker",
    summary: "Distribute AIXCO products to your client base.",
    steps: [
      "Apply for partnership and KYB review",
      "Sign distribution agreement",
      "Onboarding & product certification",
      "Access to marketing kit and CRM",
      "Co-branded campaigns & lead routing",
      "Transparent commission tracking & payouts",
    ],
  },
  {
    role: "Developer",
    summary: "Co-finance and co-deliver projects with AIXCO.",
    steps: [
      "Submit project for screening",
      "Technical, legal and market due diligence",
      "Capital structuring & term sheet",
      "Joint venture or mezzanine agreement",
      "Construction monitoring and milestones",
      "Exit, distribution and reporting",
    ],
  },
];

export const team = [
  {
    name: "Benjamin Fischer",
    role: "Chief Executive Officer",
    image: "team-benjamin",
    bio: "Benjamin leads AIXCO Global's strategy and capital markets activity. With 20+ years across European real-estate finance and private markets, he has structured over €1.2B of cross-border transactions.",
  },
  {
    name: "Owais Shaikh",
    role: "Chief Investment Officer",
    image: "team-owais",
    bio: "Owais oversees the AIXCO investment platform across Dubai and Batumi, leading underwriting, asset management and partner due diligence with a focus on risk-adjusted returns.",
  },
  {
    name: "Walter Schuster",
    role: "Chairman & Founder",
    image: "team-walter",
    bio: "Walter founded AIXCO in 2009. A veteran of central-European real-estate development, he chairs the investment committee and stewards AIXCO's institutional partnerships.",
  },
];

export const partners = [
  { name: "Global Partners", featured: true, summary: "Lead distribution partner across DACH and CEE markets." },
  { name: "ISP Group", summary: "Independent service provider for fund administration and reporting." },
  { name: "Workwise", summary: "Digital operations and broker portal infrastructure." },
  { name: "Clean Elements", summary: "Sustainability and ESG advisory across the AIXCO portfolio." },
  { name: "Revanta Capital", summary: "Co-investor on selected Dubai branded-residence projects." },
  { name: "Groupe GTI", summary: "European structuring and tax advisory partner." },
  { name: "Bluerock", summary: "Real-estate research and Black Sea market intelligence." },
  { name: "Daewoo E&C", summary: "International EPC partner on large-scale developments." },
];

export const faqGroups = [
  {
    group: "Customer",
    items: [
      { q: "What is the minimum to participate?", a: "You can participate in the AIXCO 6% Bond from €1,000. Direct apartment purchases in Batumi typically start at €50,000." },
      { q: "How are returns paid?", a: "Bond coupons are paid annually to your custody account. Apartment rental income is paid monthly net of management fees, depending on your selected program." },
      { q: "Is my capital guaranteed?", a: "No real-estate investment is risk-free. Returns depend on market conditions, project execution, and your individual situation. Please review the prospectus and consult a regulated advisor." },
      { q: "Which currencies do you accept?", a: "Subscriptions are settled in EUR. Property purchases in Batumi are denominated in USD or EUR depending on the building." },
    ],
  },
  {
    group: "Broker",
    items: [
      { q: "How does the broker program work?", a: "Approved brokers receive a co-branded portal, marketing kit and a transparent commission structure based on settled volume." },
      { q: "Where is broker activity managed?", a: "Through the AIXCO broker portal hosted on workw.com, with full lead, deal and payout tracking." },
    ],
  },
  {
    group: "Developer",
    items: [
      { q: "What projects do you co-finance?", a: "Branded residential, mixed-use, and hospitality assets in Dubai and Batumi with strong cash-flow visibility." },
      { q: "What is the typical ticket size?", a: "AIXCO typically participates with €5–25M of equity or mezzanine per project, alongside trusted local partners." },
    ],
  },
];
