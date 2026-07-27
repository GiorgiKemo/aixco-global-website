// Canonical copy from https://www.aixco.global/op2/index.html#page1.
export const company = {
  name: "AIXCO.Global",
  tagline: "Real Estate Investment",
  email: "info@aixco.global",
  address: "Grüngasse 16, 1050 Wien, Austria",
  founded: 2009,
  offices: ["Vienna", "Dubai", "Batumi"],
  socials: {
    website: "https://www.aixco.global/",
    linkedin: "https://www.linkedin.com/company/aixco-global",
    facebook: "https://www.facebook.com/profile.php?id=61589341472475",
    instagram: "https://www.instagram.com/aixco.global/",
    youtube: "",
    x: "",
  },
  portals: {
    customerLogin: "https://customer.aixco.global/",
    brokerLogin: "https://broker.aixco.global/",
    developerLogin: "https://developer.aixco.global/",
    customerSignup: "https://customer.aixco.global/",
    brokerSignup: "https://broker.aixco.global/",
    developerSignup: "https://developer.aixco.global/",
  },
};

export const metrics = [
  { value: "5,000+", label: "Trusted Clients" },
  { value: "$400M", label: "Gross Development Value (GDV)" },
  { value: "2000+", label: "Total Transactions" },
  { value: "2009", label: "In Business Since" },
  { value: "85+", label: "Employees" },
  { value: "$4.2B", label: "Real Estate Transacted" },
  { value: "$2B", label: "Developments Underway" },
  { value: "3", label: "Markets Served" },
];

export const dubaiFunds = [
  {
    id: "fund-1",
    name: "Eden House — The Canal & The Park (Dubai)",
    image: "dubai-eden",
    video: "fundOne",
    details: [
      "Status: Legacy portfolio — realized",
      "Units: 600+",
      "Development value: USD 462m",
      "Volume: Canal-front residential sold and handed over",
      "Location: Dubai Water Canal district",
      "Highlights: Prime canal-front location, strong partnerships, premium delivery",
    ],
  },
  {
    id: "fund-2",
    name: "Dubai Healthcare City (legacy development)",
    image: "dubai-healthcare",
    video: "fundTwo",
    details: [
      "Status: Legacy portfolio — in progress",
      "Development scope: USD 350m mixed-use program",
      "Site progress: ~20% developed, ~80% under construction",
      "Location: Dubai Creek - Dubai, UAE",
      "Classification: Residential buildings, offices, retail, gastronomy, healthcare",
      "Access: Al Khail Rd, 2nd Za'abeel Rd, Metro Green Line, Bus",
      "Strategy: Mixed-use masterplan combining Build-to-Rent and Build-to-Sell for an underserved millennial market",
      "Connectivity: Near DIFC, Downtown Dubai, Business Bay, Ras Al Khor Wildlife Sanctuary, and Dubai Creek Golf Club",
    ],
  },
];

const rawBatumiBenefits = [
  "Selected projects and apartments available exclusively through AIXCO",
  "100% foreign ownership",
  "No residency permit required",
  "Secure your position from €5,000",
  "Bank financing minimum 60%",
  "Approx. 12% net rental yields",
  "Full commission payable from only a 10% down payment",
  "0% capital gains tax after 2 years of ownership",
  "1% tax on rental income",
  "Full transparency through an ISO-certified system",
  "Prime apartments from our own stock at the best available prices",
];

export const batumiBenefits = rawBatumiBenefits.map((benefit) => benefit.replace(/\u00e2\u201a\u00ac/g, "€"));

export const batumiProperties = [
  {
    id: "current-project",
    name: "Reverance",
    url: "current-project",
    image: "batumi-current-project",
    video: "currentProject",
    summary: "Reverance is a premium residential complex on Batumi's New Boulevard. AIXCO currently offers 28 selected apartments on the 13th and 14th floors, with completion targeted for July 2028.",
    metrics: [
      { label: "Floors", value: "17", subtext: "per building" },
      { label: "Apartments", value: "408", subtext: "total units" },
      { label: "Completion", value: "Jul 2028", subtext: "target", highlight: true },
    ],
    highlights: [
      { label: "Current availability", value: "28 selected apartments on the 13th and 14th floors." },
      { label: "Scale", value: "25,000 sqm of comfort and community infrastructure across a 45,000 sqm planned site." },
      { label: "Location", value: "59 Adlia Street, with New Boulevard 5 minutes away, shopping and airport access 7 minutes away, and Batumi Medical Center 8 minutes away." },
      { label: "Rental case", value: "$600/month average long-term rent, $80/night average short-stay rent, and 90% potential occupancy shown in the project deck." },
    ],
  },
];

export const participationRoutes = [
  {
    id: "apartment",
    title: "Buy an Apartment with AIXCO",
    video: "batumiBuy",
    body:
      "Customers sign up, review selected apartments, book a private tour, and move through reservation and purchase with the AIXCO team.",
    cta: "Register",
  },
  {
    id: "brokerage",
    title: "Broker Real Estate with AIXCO",
    video: "batumiOverview",
    body:
      "Brokers and partners can introduce qualified buyers, coordinate tours, and manage deal flow through a structured real estate sales process.",
    cta: "Register",
  },
  {
    id: "management",
    title: "Administer Your Property",
    video: "currentProject",
    body:
      "Property owners can work with AIXCO on documentation, buyer handover, reporting, rental coordination, and ongoing administration after purchase.",
    cta: "Register",
  },
];

export const journeys = [
  {
    tag: "Journey 01",
    role: "Customer Real Estate Buyer",
    summary: "For clients buying apartments or reserving units in selected emerging markets through a guided digital process.",
    intro: "A guided process for clients purchasing or reserving selected emerging-market apartments through AIXCO's current focus.",
    steps: [
      { title: "Create your account", text: "Register and access your secure client portal." },
      { title: "Complete Profile", text: "Fill out the registration form to create your profile and access dashboard" },
      { title: "Review opportunities", text: "Browse available real estate projects, pricing, and supporting materials." },
      { title: "Select and reserve", text: "Choose the preferred apartment or reservation option." },
      { title: "Sign digitally", text: "Complete documentation online and finalize onboarding." },
      { title: "Track updates", text: "Monitor project progress, documents, and reporting through the portal." },
    ],
  },
  {
    tag: "Journey 02",
    role: "Property Owner Administration",
    summary: "For owners who want AIXCO support after purchase with handover, rental coordination, documents, and reporting.",
    intro: "A guided service path for owners who want their property administered professionally after purchase.",
    steps: [
      { title: "Register ownership details", text: "Create your account and share the apartment or property details." },
      { title: "Confirm service scope", text: "Agree what AIXCO should handle: handover, documents, rental coordination, or reporting." },
      { title: "Upload documents", text: "Provide purchase, ownership, and project materials in the secure portal." },
      { title: "Coordinate handover", text: "Track completion, snagging, key handover, and operational next steps." },
      { title: "Manage updates", text: "Receive status updates, documents, and service coordination in one place." },
      { title: "Review reporting", text: "Monitor property-related updates and owner communication online." },
    ],
  },
  {
    tag: "Journey 03",
    role: "Broker",
    summary: "For intermediaries and distribution partners introducing clients and managing deal flow.",
    intro: "A partner workflow built for referral, distribution, and client onboarding support.",
    steps: [
      { title: "Apply as partner", text: "Submit broker or intermediary details for review." },
      { title: "Complete due diligence", text: "Finalize compliance, agreements, and partner onboarding." },
      { title: "Access product materials", text: "Receive marketing packs, documentation, and platform access." },
      { title: "Introduce clients", text: "Submit leads or onboard clients through the approved journey." },
      { title: "Track pipeline", text: "Monitor progress, status, and active opportunities." },
      { title: "Coordinate execution", text: "Support the transaction process through to completion and reporting." },
    ],
  },
  {
    tag: "Journey 04",
    role: "Developer",
    summary: "For developers seeking project visibility, buyer access, tour coordination, and a stronger real estate sales channel.",
    intro: "A project sales pathway for developers seeking market access and buyer reach.",
    steps: [
      { title: "Initial project submission", text: "Share project information, structure, and commercial requirements." },
      { title: "Evaluation and fit", text: "Review commercial viability, positioning, pricing, and buyer suitability." },
      { title: "Prepare the listing", text: "Align project information, media, floor plans, pricing, and route to market." },
      { title: "Prepare launch materials", text: "Create the presentation, data room, and supporting documents." },
      { title: "Distribution and placement", text: "Connect the project to brokers, clients, and buyer networks." },
      { title: "Ongoing coordination", text: "Provide updates, milestones, tour support, and buyer communications post-launch." },
    ],
  },
];

export const team = [
  {
    name: "Benjamin Fischer",
    role: "Founder",
    image: "team-benjamin",
    summary: "Leadership, vision, and overall group direction.",
    bio:
      "Benjamin Fischer is presented in the AIXCO team section as Founder, reflecting his leadership role across the group’s strategic direction and overall platform development.",
    points: [
      { title: "Primary role", text: "Leadership and group-level strategic direction." },
      { title: "Focus", text: "Vision, growth, partnerships, and long-term platform positioning." },
    ],
  },
  {
    name: "Owais Shaikh",
    role: "Partner",
    image: "team-owais",
    summary: "Capital markets, banking relationships, and financial structuring.",
    bio:
      "Owais Shaikh is listed in the AIXCO team section as Partner covering Banking and Finance, positioning him around financing relationships, transaction structuring, and institutional financial coordination.",
    points: [
      { title: "Primary role", text: "Banking and finance leadership across transactions and structuring." },
      { title: "Focus", text: "Capital access, financial coordination, and execution support." },
    ],
  },
  {
    name: "Walter Schuster",
    role: "Partner",
    image: "team-walter",
    summary: "Product positioning, channel development, and distribution strategy.",
    bio:
      "Walter Schuster is listed in the AIXCO team section as Partner responsible for Products and Distribution, reflecting his role in product strategy, market positioning, and channel development.",
    points: [
      { title: "Primary role", text: "Products and distribution leadership." },
      { title: "Focus", text: "Go-to-market strategy, product positioning, and partner distribution." },
    ],
  },
];

export const partners = [
  {
    name: "Global Partners",
    group: "Group companies",
    modalLabel: "Featured highlight \u00b7 UAE focus",
    featured: true,
    logo: "globalPartners",
    summary: "Real estate development and asset management platform.",
    featuredDetail: [
      "A premier real estate company focused on identifying, acquiring, and managing high-potential residential and commercial developments.",
      "The business is positioned around value creation through strategic asset selection, operational excellence, redevelopment, and property management.",
    ],
    detail: [
      "Global Partners is presented by AIXCO as a premier real estate company focused on identifying, acquiring, and managing high-potential residential and commercial developments.",
      "The positioning emphasizes value creation through strategic asset selection, operational excellence, development, redevelopment, and property management.",
    ],
    leaders: [
      { name: "H.H Sheikh Maktoum Butti Maktoum Juma Al Maktoum", role: "Chairman", image: "butti" },
      { name: "H.H. Sheikh Rashid Butti Maktoum Juma Al Maktoum", role: "Director", image: "rashid" },
      { name: "Bader Hareb", role: "Executive Chairman", image: "bader" },
      { name: "Warren Blore", role: "Chief Financial Officer", image: "warren" },
    ],
  },
  {
    name: "ISP Group",
    group: "Group companies",
    modalLabel: "Group company",
    logo: "isp",
    summary: "Diversified services and operating business.",
    detail: [
      "ISP Group is described in the AIXCO source as a diversified services firm specializing in the acquisition, management, and transformation of businesses across multiple industries.",
    ],
    facts: [
      { title: "Positioning", text: "Diversified services and operating platform." },
      { title: "Role", text: "Business acquisition, management, and transformation across sectors." },
    ],
  },
  {
    name: "Workwise",
    group: "Group companies",
    modalLabel: "Group company",
    logo: "workwise",
    summary: "Enterprise SaaS and fintech operating platform.",
    detail: [
      "Workwise is described as a next-generation enterprise SaaS and fintech platform built to unify communication, HR, finance, project management, approvals, documents, and digital lending in one ecosystem.",
      "The uploaded materials say the platform is designed to eliminate fragmented systems, reduce costs, improve productivity, and support localized enterprise requirements.",
    ],
    facts: [
      { title: "Core modules", text: "Communication, approvals, finance, document tools, HR, projects, and fintech workflows." },
      { title: "Market angle", text: "Built for underserved SMEs and enterprise users, with a stated path to high recurring revenue at scale." },
    ],
  },
  {
    name: "Clean Elements",
    group: "Group companies",
    modalLabel: "Group company",
    logo: "cleanElements",
    summary: "Clean-tech and lithium asset company.",
    detail: [
      "Clean Elements is described in the AIXCO source as a clean-products and lithium asset company positioned around environmental transition themes.",
    ],
    facts: [
      { title: "Theme", text: "Clean products and environmental transition exposure." },
      { title: "Positioning", text: "Presented as a fast-growing lithium asset holding company." },
    ],
  },
  {
    name: "Revanta Capital",
    group: "Strategic partners",
    modalLabel: "Strategic partner",
    logo: "revanta",
    summary: "DFSA-regulated financial services firm in DIFC.",
    detail: [
      "Revanta Capital is described in the AIXCO source as a DFSA-regulated financial services firm based in the Dubai International Financial Centre.",
    ],
  },
  {
    name: "Groupe GTI",
    group: "Strategic partners",
    modalLabel: "Strategic partner",
    logo: "gti",
    summary: "Advisory collective for growth businesses.",
    detail: [
      "Groupe GTI is presented as an advisory collective focused on accelerating growth-oriented enterprises, especially across technology, infrastructure, and industrial sectors.",
    ],
  },
  {
    name: "Bluerock",
    group: "Strategic partners",
    modalLabel: "Strategic partner",
    logo: "bluerock",
    summary: "Financial consultancy focused on planning and advisory.",
    detail: [
      "Bluerock is described as a financial consultancy delivering data-driven strategies in planning and advisory, with a client-focused approach aimed at sustainable growth.",
    ],
  },
  {
    name: "Daewoo E&C",
    group: "Strategic partners",
    modalLabel: "Strategic partner",
    logo: "daewoo",
    summary: "Large-scale infrastructure and urban development partner.",
    detail: [
      "Daewoo Engineering and Construction is described as a leading South Korean company specializing in large-scale infrastructure, industrial plants, and urban development projects worldwide.",
    ],
  },
];

export const faqGroups = [
  {
    group: "Real Estate Investment",
    description: "Questions and answers for clients reviewing AIXCO real estate opportunities in Batumi.",
    items: [
      {
        q: "How do I get started?",
        a: "To get started, please register on our website. Once your account is created, you will receive all further information via email.",
      },
      {
        q: "What is the minimum investment amount?",
        a: "The minimum investment amount is €5,000.",
      },
      {
        q: "Why is Batumi an attractive location for real estate investment?",
        a: "Batumi is one of the fastest-growing coastal cities in Eastern Europe, offering tourism growth, modern infrastructure, and investor-friendly policies.",
      },
      {
        q: "Can foreigners buy property in Batumi, Georgia?",
        a: "Yes, foreigners can freely purchase and own real estate with minimal restrictions.",
      },
      {
        q: "What is the process of buying property in Batumi?",
        a: "The process is simple: sign agreement and register ownership, often within days.",
      },
      {
        q: "Are there additional costs when buying property?",
        a: "There are very low costs and no property purchase tax.",
      },
      {
        q: "How secure is a real estate investment in Batumi?",
        a: "Georgia offers strong legal protection and transparent ownership systems.",
      },
      {
        q: "Can I invest through a company or only as an individual?",
        a: "You can invest either as an individual or through a company, depending on your personal, tax, or investment objectives.",
      },
      {
        q: "What value increase can I calculate for my apartment?",
        a: "Independent market research from Colliers Georgia indicates that residential property prices in Batumi have historically increased by approximately 8-15% annually, depending on location and property type.",
      },
      {
        q: "What kind of reporting do I get?",
        a: "You will receive quarterly reports covering your property's performance and the general market.",
      },
      {
        q: "Is a credit check required for bank financing?",
        a: "For 60% financing a traditional credit check is not required. Higher financing amounts may require standard bank credit approval and income verification.",
      },
      {
        q: "How much equity do I need to have to purchase an apartment?",
        a: "Typically, buyers contribute 40% equity, with financing available for up to 60% of the property value. Depending on your financial profile and financing structure, the required equity contribution may be lower.",
      },
    ],
  },
];
