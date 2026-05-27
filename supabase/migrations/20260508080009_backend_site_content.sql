create table public.site_content_entries (
  id uuid primary key default extensions.gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  section text not null,
  entry_key text not null,
  locale text not null default 'en',
  sort_order integer not null default 0,
  is_published boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  constraint site_content_entries_section_check check (section ~ '^[a-z0-9_]+$'),
  constraint site_content_entries_entry_key_check check (entry_key ~ '^[a-z0-9_-]+$'),
  constraint site_content_entries_locale_check check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  constraint site_content_entries_payload_shape_check check (jsonb_typeof(payload) in ('object', 'array')),
  constraint site_content_entries_unique_key unique (section, locale, entry_key)
);

create trigger site_content_entries_set_updated_at
before update on public.site_content_entries
for each row execute function private.set_updated_at();

alter table public.site_content_entries enable row level security;
alter table public.site_content_entries force row level security;

create policy site_content_entries_select_published
on public.site_content_entries
for select
to anon, authenticated
using (is_published);

revoke all on public.site_content_entries from anon, authenticated;
grant select on public.site_content_entries to anon, authenticated;
grant all on public.site_content_entries to service_role;

create index site_content_entries_published_locale_section_idx
on public.site_content_entries (locale, section, sort_order)
where is_published;

create index site_content_entries_updated_at_idx
on public.site_content_entries (updated_at desc);

comment on table public.site_content_entries is 'Published AIXCO website content moved from frontend constants into Supabase.';

insert into public.site_content_entries (section, entry_key, locale, sort_order, is_published, payload)
values
(
  'company',
  'profile',
  'en',
  0,
  true,
  $${
    "name": "AIXCO.Global",
    "tagline": "Quality Real Estate — Buy · Broker · Manage",
    "email": "info@aixco.global",
    "address": "Gr\u00fcngasse 16, 1050 Wien, Austria",
    "founded": 2009,
    "offices": ["Vienna", "Dubai", "Batumi"],
    "socials": {
      "linkedin": "https://www.linkedin.com/company/aixco-global",
      "instagram": "https://www.instagram.com/aixco.global",
      "youtube": "https://www.youtube.com/@aixco-global",
      "x": "https://x.com/aixcoglobal"
    },
    "portals": {
      "customerLogin": "https://workw.com/realestate/customer/login",
      "brokerLogin": "https://workw.com/realestate/broker/login",
      "developerLogin": "https://workw.com/realestate/developer/login",
      "customerSignup": "https://workw.com/realestate/customer/signup",
      "brokerSignup": "https://workw.com/realestate/broker/signup",
      "developerSignup": "https://workw.com/realestate/developer/signup"
    }
  }$$::jsonb
),
(
  'metrics',
  'items',
  'en',
  10,
  true,
  $$[
    { "value": "5,000+", "label": "Trusted Clients" },
    { "value": "$400M", "label": "Gross Development Value (GDV)" },
    { "value": "500+", "label": "Total Transactions" },
    { "value": "2009", "label": "In Business Since" },
    { "value": "85+", "label": "Employees" },
    { "value": "$4.2B", "label": "Real Estate Transacted" },
    { "value": "$2B", "label": "Developments Underway" },
    { "value": "3", "label": "Markets Served" }
  ]$$::jsonb
),
(
  'dubai_funds',
  'items',
  'en',
  20,
  true,
  $$[
    {
      "id": "fund-1",
      "name": "Eden House — The Canal & The Park (Dubai)",
      "image": "dubai-eden",
      "video": "fundOne",
      "details": [
        "Status: Legacy portfolio — realized",
        "Units: 600+",
        "Development value: USD 462m",
        "Volume: Canal-front residential sold and handed over",
        "Location: Dubai Water Canal district",
        "Highlights: Prime canal-front location, strong partnerships, premium delivery"
      ]
    },
    {
      "id": "fund-2",
      "name": "Dubai Healthcare City (legacy development)",
      "image": "dubai-healthcare",
      "video": "fundTwo",
      "details": [
        "Status: Legacy portfolio — in progress",
        "Development scope: USD 350m mixed-use program",
        "Site progress: ~20% developed, ~20% under construction",
        "Location: Dubai Creek - Dubai, UAE",
        "Classification: Residential buildings, offices, retail, gastronomy, healthcare",
        "Access: Al Khail Rd, 2nd Za'abeel Rd, Metro Green Line, Bus",
        "Strategy: Mixed-use masterplan combining Build-to-Rent and Build-to-Sell for an underserved millennial market",
        "Connectivity: Near DIFC, Downtown Dubai, Business Bay, Ras Al Khor Wildlife Sanctuary, and Dubai Creek Golf Club"
      ]
    }
  ]$$::jsonb
),
(
  'batumi_benefits',
  'items',
  'en',
  30,
  true,
  $$[
    "Rental income scenarios from 8%",
    "Annual price growth of up to 12%",
    "Property prices starting from \u20ac50,000",
    "Full foreign ownership permitted",
    "Low rental tax of 1% (up to \u20ac180,000/year)",
    "Capital gains tax exemption after 2 years",
    "Financing 60% of property value"
  ]$$::jsonb
),
(
  'batumi_properties',
  'items',
  'en',
  40,
  true,
  $$[
    {
      "id": "guru",
      "name": "Guru",
      "url": "guru",
      "image": "batumi-guru",
      "video": "guruBatumi",
      "summary": "Guru Status is in its final construction phase: a Batumi residence with 29 floors, 667 apartments, 85% sold, and a location about 150 meters from the sea.",
      "metrics": [
        { "label": "Floors", "value": "29", "subtext": "floors" },
        { "label": "Apartments", "value": "667", "subtext": "units" },
        { "label": "Sold", "value": "85%", "subtext": "apartments", "highlight": true }
      ],
      "highlights": [
        { "label": "Scale", "value": "3,000 sqm of infrastructure area and 4,000 sqm total site area." },
        { "label": "Location", "value": "About 150 meters from the sea, with the beach 5 minutes away and Grand Mall 8 minutes away by car." },
        { "label": "Rental case", "value": "$600/month average long-term rent, $80/night average short-stay rent, and 90% potential occupancy shown in the project deck." }
      ]
    },
    {
      "id": "otium",
      "name": "Otium",
      "url": "otium",
      "image": "batumi-otium",
      "video": "otium",
      "summary": "Reverance by Otium is a premium residential complex at 59 Adlia Street, planned with 17 floors per building, 408 apartments, and completion targeted for June 2028.",
      "metrics": [
        { "label": "Floors", "value": "17", "subtext": "per building" },
        { "label": "Apartments", "value": "408", "subtext": "total units" },
        { "label": "Completion", "value": "Jun 2028", "subtext": "target", "highlight": true }
      ],
      "highlights": [
        { "label": "Scale", "value": "25,000 sqm of comfort and community infrastructure across a 45,000 sqm planned site." },
        { "label": "Location", "value": "59 Adlia Street, with New Boulevard 5 minutes away, shopping and airport access 7 minutes away, and Batumi Medical Center 8 minutes away." },
        { "label": "Rental case", "value": "$600/month average long-term rent, $80/night average short-stay rent, and 90% potential occupancy shown in the project deck." }
      ]
    }
  ]$$::jsonb
),
(
  'participation_routes',
  'items',
  'en',
  50,
  true,
  $$[
    {
      "id": "apartment",
      "title": "Buy an Apartment in Batumi",
      "video": "batumiBuy",
      "body": "Customers sign up, review selected Batumi apartments, book a private tour, and move through reservation and purchase with the AIXCO team.",
      "cta": "Register"
    },
    {
      "id": "brokerage",
      "title": "Broker Real Estate with AIXCO",
      "video": "batumiBuy",
      "body": "Brokers and partners can introduce qualified buyers, coordinate tours, and manage deal flow through a structured real estate sales process.",
      "cta": "Register"
    },
    {
      "id": "management",
      "title": "Administer Your Property",
      "video": "batumiBuy",
      "body": "Property owners can work with AIXCO on documentation, buyer handover, reporting, rental coordination, and ongoing administration after purchase.",
      "cta": "Register"
    }
  ]$$::jsonb
),
(
  'journeys',
  'items',
  'en',
  60,
  true,
  $$[
    {
      "tag": "Journey 01",
      "role": "Customer Real Estate Buyer",
      "summary": "For clients looking to access selected real estate opportunities through a guided digital process.",
      "intro": "A guided process for clients participating in selected real estate opportunities.",
      "steps": [
        { "title": "Create your account", "text": "Register and access your secure client portal." },
        { "title": "Complete Profile", "text": "Fill out the registration form to create your profile and access dashboard" },
        { "title": "Review opportunities", "text": "Browse available real estate projects, pricing, and supporting materials." },
        { "title": "Select and reserve", "text": "Choose the preferred apartment or reservation option." },
        { "title": "Sign digitally", "text": "Complete documentation online and finalize onboarding." },
        { "title": "Track updates", "text": "Monitor project progress, documents, and reporting through the portal." }
      ]
    },
    {
      "tag": "Journey 02",
      "role": "Property Owner Administration",
      "summary": "For owners who want AIXCO support after purchase with handover, rental coordination, documents, and reporting.",
      "intro": "A guided service path for owners who want their property administered professionally after purchase.",
      "steps": [
        { "title": "Register ownership details", "text": "Create your account and share the apartment or property details." },
        { "title": "Confirm service scope", "text": "Agree what AIXCO should handle: handover, documents, rental coordination, or reporting." },
        { "title": "Upload documents", "text": "Provide purchase, ownership, and project materials in the secure portal." },
        { "title": "Coordinate handover", "text": "Track completion, snagging, key handover, and operational next steps." },
        { "title": "Manage updates", "text": "Receive status updates, documents, and service coordination in one place." },
        { "title": "Review reporting", "text": "Monitor property-related updates and owner communication online." }
      ]
    },
    {
      "tag": "Journey 03",
      "role": "Broker",
      "summary": "For intermediaries and distribution partners introducing clients and managing deal flow.",
      "intro": "A partner workflow built for referral, distribution, and client onboarding support.",
      "steps": [
        { "title": "Apply as partner", "text": "Submit broker or intermediary details for review." },
        { "title": "Complete due diligence", "text": "Finalize compliance, agreements, and partner onboarding." },
        { "title": "Access product materials", "text": "Receive marketing packs, documentation, and platform access." },
        { "title": "Introduce clients", "text": "Submit leads or onboard clients through the approved journey." },
        { "title": "Track pipeline", "text": "Monitor progress, status, and active opportunities." },
        { "title": "Coordinate execution", "text": "Support the transaction process through to completion and reporting." }
      ]
    },
    {
      "tag": "Journey 04",
      "role": "Developer",
      "summary": "For developers seeking project visibility, buyer access, tour coordination, and a stronger real estate sales channel.",
      "intro": "A project sales pathway for developers seeking market access and buyer reach.",
      "steps": [
        { "title": "Initial project submission", "text": "Share project information, structure, and commercial requirements." },
        { "title": "Evaluation and fit", "text": "Review commercial viability, positioning, pricing, and buyer suitability." },
        { "title": "Prepare the listing", "text": "Align project information, media, floor plans, pricing, and route to market." },
        { "title": "Prepare launch materials", "text": "Create the presentation, data room, and supporting documents." },
        { "title": "Distribution and placement", "text": "Connect the project to brokers, clients, and buyer networks." },
        { "title": "Ongoing coordination", "text": "Provide updates, milestones, tour support, and buyer communications post-launch." }
      ]
    }
  ]$$::jsonb
),
(
  'team',
  'items',
  'en',
  70,
  true,
  $$[
    {
      "name": "Benjamin Fischer",
      "role": "Founder",
      "image": "team-benjamin",
      "summary": "Leadership, vision, and overall group direction.",
      "bio": "Benjamin Fischer is presented in the AIXCO team section as Founder, reflecting his leadership role across the group\u2019s strategic direction and overall platform development.",
      "points": [
        { "title": "Primary role", "text": "Leadership and group-level strategic direction." },
        { "title": "Focus", "text": "Vision, growth, partnerships, and long-term platform positioning." }
      ]
    },
    {
      "name": "Owais Shaikh",
      "role": "Partner",
      "image": "team-owais",
      "summary": "Capital markets, banking relationships, and financial structuring.",
      "bio": "Owais Shaikh is listed in the AIXCO team section as Partner covering Banking and Finance, positioning him around financing relationships, transaction structuring, and institutional financial coordination.",
      "points": [
        { "title": "Primary role", "text": "Banking and finance leadership across transactions and structuring." },
        { "title": "Focus", "text": "Capital access, financial coordination, and execution support." }
      ]
    },
    {
      "name": "Walter Schuster",
      "role": "Partner",
      "image": "team-walter",
      "summary": "Product positioning, channel development, and distribution strategy.",
      "bio": "Walter Schuster is listed in the AIXCO team section as Partner responsible for Products and Distribution, reflecting his role in product strategy, market positioning, and channel development.",
      "points": [
        { "title": "Primary role", "text": "Products and distribution leadership." },
        { "title": "Focus", "text": "Go-to-market strategy, product positioning, and partner distribution." }
      ]
    }
  ]$$::jsonb
),
(
  'partners',
  'items',
  'en',
  80,
  true,
  $$[
    {
      "name": "Global Partners",
      "group": "Group companies",
      "modalLabel": "Featured highlight \u00b7 UAE focus",
      "featured": true,
      "logo": "globalPartners",
      "summary": "Real estate development and asset management platform.",
      "featuredDetail": [
        "A premier real estate platform focused on identifying, acquiring, and managing high-potential residential and commercial developments.",
        "The business is positioned around value creation through strategic asset selection, operational excellence, redevelopment, and property management."
      ],
      "detail": [
        "Global Partners is presented by AIXCO as a premier real estate platform focused on identifying, acquiring, and managing high-potential residential and commercial developments.",
        "The positioning emphasizes value creation through strategic asset selection, operational excellence, development, redevelopment, and property management."
      ],
      "leaders": [
        { "name": "H.H Sheikh Maktoum Butti Maktoum Juma Al Maktoum", "role": "Chairman", "image": "butti" },
        { "name": "H.H. Sheikh Rashid Butti Maktoum Juma Al Maktoum", "role": "Director", "image": "rashid" },
        { "name": "Bader Hareb", "role": "Executive Chairman", "image": "bader" },
        { "name": "Warren Blore", "role": "Chief Financial Officer", "image": "warren" }
      ]
    },
    {
      "name": "ISP Group",
      "group": "Group companies",
      "modalLabel": "Group company",
      "logo": "isp",
      "summary": "Diversified services and operating business.",
      "detail": [
        "ISP Group is described in the AIXCO source as a diversified services firm specializing in the acquisition, management, and transformation of businesses across multiple industries."
      ],
      "facts": [
        { "title": "Positioning", "text": "Diversified services and operating platform." },
        { "title": "Role", "text": "Business acquisition, management, and transformation across sectors." }
      ]
    },
    {
      "name": "Workwise",
      "group": "Group companies",
      "modalLabel": "Group company",
      "logo": "workwise",
      "summary": "Enterprise SaaS and fintech operating platform.",
      "detail": [
        "Workwise is described as a next-generation enterprise SaaS and fintech platform built to unify communication, HR, finance, project management, approvals, documents, and digital lending in one ecosystem.",
        "The uploaded materials say the platform is designed to eliminate fragmented systems, reduce costs, improve productivity, and support localized enterprise requirements."
      ],
      "facts": [
        { "title": "Core modules", "text": "Communication, approvals, finance, document tools, HR, projects, and fintech workflows." },
        { "title": "Market angle", "text": "Built for underserved SMEs and enterprise users, with a stated path to high recurring revenue at scale." }
      ]
    },
    {
      "name": "Clean Elements",
      "group": "Group companies",
      "modalLabel": "Group company",
      "logo": "cleanElements",
      "summary": "Clean-tech and lithium asset company.",
      "detail": [
        "Clean Elements is described in the AIXCO source as a clean-products and lithium asset company positioned around environmental transition themes."
      ],
      "facts": [
        { "title": "Theme", "text": "Clean products and environmental transition exposure." },
        { "title": "Positioning", "text": "Presented as a fast-growing lithium asset holding company." }
      ]
    },
    {
      "name": "Revanta Capital",
      "group": "Strategic partners",
      "modalLabel": "Strategic partner",
      "logo": "revanta",
      "summary": "DFSA-regulated financial services firm in DIFC.",
      "detail": [
        "Revanta Capital is described in the AIXCO source as a DFSA-regulated financial services firm based in the Dubai International Financial Centre."
      ]
    },
    {
      "name": "Groupe GTI",
      "group": "Strategic partners",
      "modalLabel": "Strategic partner",
      "logo": "gti",
      "summary": "Advisory collective for growth businesses.",
      "detail": [
        "Groupe GTI is presented as an advisory collective focused on accelerating growth-oriented enterprises, especially across technology, infrastructure, and industrial sectors."
      ]
    },
    {
      "name": "Bluerock",
      "group": "Strategic partners",
      "modalLabel": "Strategic partner",
      "logo": "bluerock",
      "summary": "Financial consultancy focused on planning and advisory.",
      "detail": [
        "Bluerock is described as a financial consultancy delivering data-driven strategies in planning and advisory, with a client-focused approach aimed at sustainable growth."
      ]
    },
    {
      "name": "Daewoo E&C",
      "group": "Strategic partners",
      "modalLabel": "Strategic partner",
      "logo": "daewoo",
      "summary": "Large-scale infrastructure and urban development partner.",
      "detail": [
        "Daewoo Engineering and Construction is described as a leading South Korean company specializing in large-scale infrastructure, industrial plants, and urban development projects worldwide."
      ]
    }
  ]$$::jsonb
),
(
  'faq_groups',
  'items',
  'en',
  90,
  true,
  $$[
    {
      "group": "Customer",
      "description": "Buying property, reserving apartments, or working with AIXCO on real estate services.",
      "items": [
        { "q": "What is the minimum amount to reserve or buy?", "a": "Typical entry starts from \u20ac10,000. On selected Batumi apartments from \u20ac50,000, a 10% reservation (from \u20ac5,000) may be available\u2014final terms depend on the project and purchase agreement." },
        { "q": "Can I buy property directly?", "a": "Yes. Customers may pursue direct apartment purchase, brokerage support, or property administration." },
        { "q": "Is rental income guaranteed?", "a": "No. Rental income, resale value, and timing depend on market conditions, occupancy, property management, and project delivery." },
        { "q": "Will I receive reporting?", "a": "Yes. Reporting, documents, and project updates are available through the portal." },
        { "q": "Can foreigners buy property in Batumi?", "a": "Yes. Foreigners can purchase and own real estate with minimal restrictions." }
      ]
    },
    {
      "group": "Broker",
      "description": "For intermediaries managing clients, tours, and deal flow.",
      "items": [
        { "q": "What are the benefits for brokers?", "a": "Brokers gain structured client management, curated listings, stronger presentation tools, and better coordination." },
        { "q": "Can I book a tour for my customer?", "a": "Yes. The platform supports tour coordination and a smoother customer journey." },
        { "q": "Do login and registration do different things?", "a": "Yes. Login opens the relevant portal. Register starts the onboarding process for access approval." },
        { "q": "What support is available after sign-up?", "a": "AIXCO provides follow-up support, coordination, and a more guided service model rather than simple self-service." }
      ]
    },
    {
      "group": "Developer",
      "description": "For developers listing projects and using AIXCO as a sales channel.",
      "items": [
        { "q": "What do developers gain by registering?", "a": "Developers gain stronger project exposure, better inquiry handling, coordinated tours, and a more premium end-to-end sales flow." },
        { "q": "Can AIXCO help distribute projects?", "a": "Yes. AIXCO can function as a structured distribution and presentation channel for selected listings." },
        { "q": "Does AIXCO support the sales process?", "a": "Yes. Support can include project visibility, lead handling, tours, and documentation flow." }
      ]
    }
  ]$$::jsonb
),
(
  'news_ticker',
  'items',
  'en',
  100,
  true,
  $$[
    {
      "id": "batumi-development-update",
      "title": "Batumi development update: strong buyer demand",
      "source": "Agency",
      "date": "May 2026",
      "href": "https://www.aixco.global/op2/index.html#batumi"
    },
    {
      "id": "dubai-legacy-milestone",
      "title": "AIXCO completes Eden House phase in Dubai legacy portfolio",
      "source": "AIXCO",
      "date": "May 2026",
      "href": "https://www.aixco.global/op2/index.html#page1"
    },
    {
      "id": "black-sea-corridor",
      "title": "Black Sea corridor demand strengthens across coastal assets",
      "source": "Market",
      "date": "Apr 2026",
      "href": "https://www.aixco.global/op2/index.html#batumi"
    },
    {
      "id": "rental-income-note",
      "title": "Agency note: short-term rental demand remains a key Batumi driver",
      "source": "Agency",
      "date": "Apr 2026",
      "href": "https://www.aixco.global/op2/index.html#batumi"
    },
    {
      "id": "partner-update",
      "title": "Strategic partner update published for infrastructure partners",
      "source": "Partners",
      "date": "Apr 2026",
      "href": "https://www.aixco.global/op2/index.html#page5"
    },
    {
      "id": "participation-model",
      "title": "New guide: buying Batumi apartments from EUR 50,000",
      "source": "AIXCO",
      "date": "Mar 2026",
      "href": "https://www.aixco.global/op2/index.html#page6"
    }
  ]$$::jsonb
)
on conflict (section, locale, entry_key)
do update set
  sort_order = excluded.sort_order,
  is_published = excluded.is_published,
  payload = excluded.payload,
  updated_at = now();
