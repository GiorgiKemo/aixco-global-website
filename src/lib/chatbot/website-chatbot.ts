import type { ChatMessageInput } from "@/lib/backend/lead-capture-contracts";
import type { SiteContent } from "@/lib/backend/site-content";

type KnowledgeSection =
  | "company"
  | "metrics"
  | "dubai"
  | "batumi"
  | "participation"
  | "journey"
  | "team"
  | "partners"
  | "faq"
  | "news";

type KnowledgeEntry = {
  id: string;
  section: KnowledgeSection;
  title: string;
  answer: string;
  keywords: string[];
  priority: number;
  searchText: string;
};

export type WebsiteChatbotAnswer = {
  answer: string;
  confidence: "high" | "medium" | "low";
  matchedTopics: string[];
};

const STOP_WORDS = new Set([
  "a",
  "about",
  "all",
  "am",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "can",
  "do",
  "does",
  "for",
  "from",
  "has",
  "have",
  "help",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "please",
  "should",
  "tell",
  "the",
  "there",
  "to",
  "want",
  "what",
  "when",
  "where",
  "who",
  "why",
  "with",
  "you",
]);

const QUERY_ALIASES: Record<string, string[]> = {
  apartment: ["property", "real", "estate", "batumi"],
  apartments: ["property", "real", "estate", "batumi"],
  apply: ["register", "signup", "onboarding"],
  bond: ["6%", "subscription", "investor", "fixed", "income"],
  buy: ["purchase", "register", "customer"],
  contact: ["email", "address", "team"],
  developer: ["project", "distribution", "placement", "listing"],
  faq: ["question", "answer"],
  foreigner: ["foreign", "ownership", "batumi"],
  foreigners: ["foreign", "ownership", "batumi"],
  invest: ["investment", "participation", "subscribe"],
  investor: ["investment", "participation", "subscribe"],
  login: ["portal", "access"],
  price: ["pricing", "minimum", "entry", "amount"],
  register: ["signup", "apply", "onboarding", "portal"],
  roi: ["return", "yield", "income", "performance"],
  signup: ["register", "apply", "onboarding"],
  tax: ["rental", "capital", "gains"],
  yield: ["return", "income", "roi"],
};

const DISPLAY_TEXT_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  ["\u00e2\u0082\u00ac", "\u20ac"],
  ["\u00e2\u20ac\u00ac", "\u20ac"],
  ["\u00c3\u00a2\u00e2\u20ac\u0161\u00c2\u00ac", "\u20ac"],
  ["\u00c3\u00bc", "\u00fc"],
  ["\u00e2\u20ac\u2122", "'"],
  ["\u00e2\u20ac\u0153", '"'],
  ["\u00e2\u20ac\ufffd", '"'],
  ["\u00e2\u20ac\u201c", "-"],
  ["\u00e2\u20ac\u201d", "-"],
  ["\u00c2\u00b7", "-"],
];

function sanitizeDisplayText(value: string | null | undefined) {
  let text = value ?? "";

  for (const [search, replacement] of DISPLAY_TEXT_REPLACEMENTS) {
    text = text.split(search).join(replacement);
  }

  return text.replace(/\s+/g, " ").trim();
}

function normalizeText(value: string | null | undefined) {
  return sanitizeDisplayText(value)
    .toLowerCase()
    .replace(/\u20ac/g, " eur ")
    .replace(/€|â‚¬/g, " eur ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9%]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueItems<T>(items: T[]) {
  return [...new Set(items)];
}

function tokenize(value: string) {
  const tokens = normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

  return uniqueItems(
    tokens.flatMap((token) => [
      token,
      ...(QUERY_ALIASES[token] ?? []),
    ]),
  );
}

function compactSentence(parts: Array<string | null | undefined>) {
  return sanitizeDisplayText(parts.filter(Boolean).join(" "));
}

function entry(input: Omit<KnowledgeEntry, "searchText">): KnowledgeEntry {
  const title = sanitizeDisplayText(input.title);
  const answer = sanitizeDisplayText(input.answer);

  return {
    ...input,
    title,
    answer,
    searchText: normalizeText([title, answer, input.keywords.join(" ")].join(" ")),
  };
}

function listSteps(steps: Array<{ title: string; text: string }>) {
  return steps.map((step) => `${step.title}: ${step.text}`).join(" ");
}

export function buildWebsiteKnowledgeBase(content: SiteContent): KnowledgeEntry[] {
  const entries: KnowledgeEntry[] = [
    entry({
      id: "company-profile",
      section: "company",
      title: "AIXCO.Global company profile",
      priority: 9,
      keywords: ["company", "about", "offices", "founded", "address", "email", "contact"],
      answer: `${content.company.name} is a real estate participation platform founded in ${content.company.founded}, with offices in ${content.company.offices.join(", ")}. The website positions AIXCO around selected real estate projects, long-term value creation, and private partner participation. Contact: ${content.company.email}. Address: ${content.company.address}.`,
    }),
    entry({
      id: "contact",
      section: "company",
      title: "Contact AIXCO",
      priority: 10,
      keywords: ["contact", "email", "address", "support", "team", "representative"],
      answer: `You can contact AIXCO at ${content.company.email}. The listed address is ${content.company.address}. If you want the team to follow up, send your preferred route, budget, role, and timeline in this chat or use the contact form.`,
    }),
    entry({
      id: "metrics",
      section: "metrics",
      title: "AIXCO track record metrics",
      priority: 7,
      keywords: ["metrics", "track record", "clients", "transactions", "capital", "gdv", "employees"],
      answer: `The website highlights ${content.metrics.map((metric) => `${metric.value} ${metric.label}`).join(", ")}.`,
    }),
  ];

  for (const route of content.participationRoutes) {
    entries.push(
      entry({
        id: `participation-${route.id}`,
        section: "participation",
        title: route.title,
        priority: route.id === "bond" ? 10 : 9,
        keywords: [route.id, route.title, route.cta, "participate", "register", "onboarding"],
        answer: `${route.title}: ${route.body} The website CTA for this route is ${route.cta}.`,
      }),
    );
  }

  entries.push(
    entry({
      id: "batumi-market",
      section: "batumi",
      title: "Why Batumi",
      priority: 10,
      keywords: ["batumi", "georgia", "yield", "tax", "ownership", "financing", "price", "growth"],
      answer: `The Batumi section highlights ${content.batumiBenefits.join(", ")}. The website also says foreigners can purchase and own real estate with minimal restrictions.`,
    }),
  );

  for (const property of content.batumiProperties) {
    entries.push(
      entry({
        id: `batumi-${property.id}`,
        section: "batumi",
        title: property.name,
        priority: 9,
        keywords: [property.name, "batumi", "apartment", "property", ...property.metrics.map((metric) => metric.label)],
        answer: `${property.name}: ${property.summary} Key details: ${property.metrics.map((metric) => `${metric.label} ${metric.value}${metric.subtext ? ` ${metric.subtext}` : ""}`).join(", ")}. Highlights: ${property.highlights.map((item) => `${item.label}: ${item.value}`).join(" ")}`,
      }),
    );
  }

  for (const fund of content.dubaiFunds) {
    entries.push(
      entry({
        id: `dubai-${fund.id}`,
        section: "dubai",
        title: fund.name,
        priority: 8,
        keywords: [fund.name, "dubai", "fund", "healthcare", "eden", "canal", "park", "irr", "performance"],
        answer: `${fund.name}: ${fund.details.join(". ")}.`,
      }),
    );
  }

  for (const journey of content.journeys) {
    entries.push(
      entry({
        id: `journey-${journey.role}`,
        section: "journey",
        title: `${journey.role} journey`,
        priority: 8,
        keywords: [journey.role, journey.tag, "journey", "onboarding", "register", "process", "steps"],
        answer: `${journey.role}: ${journey.summary} ${journey.intro} Steps: ${listSteps(journey.steps)}`,
      }),
    );
  }

  for (const group of content.faqGroups) {
    for (const item of group.items) {
      entries.push(
        entry({
          id: `faq-${group.group}-${item.q}`,
          section: "faq",
          title: item.q,
          priority: 12,
          keywords: [group.group, group.description, item.q],
          answer: `${item.a}`,
        }),
      );
    }
  }

  for (const member of content.team) {
    entries.push(
      entry({
        id: `team-${member.name}`,
        section: "team",
        title: member.name,
        priority: 6,
        keywords: [member.name, member.role, "team", "leadership", "founder", "partner"],
        answer: `${member.name} is listed as ${member.role}. ${member.summary} ${member.bio}`,
      }),
    );
  }

  for (const partner of content.partners) {
    entries.push(
      entry({
        id: `partner-${partner.name}`,
        section: "partners",
        title: partner.name,
        priority: 6,
        keywords: [partner.name, partner.group, "partner", "group company", "strategic"],
        answer: compactSentence([
          `${partner.name} is listed under ${partner.group}.`,
          partner.summary,
          partner.detail?.join(" "),
          partner.facts?.map((fact) => `${fact.title}: ${fact.text}`).join(" "),
        ]),
      }),
    );
  }

  for (const newsItem of content.newsTickerItems) {
    entries.push(
      entry({
        id: `news-${newsItem.title}`,
        section: "news",
        title: newsItem.title,
        priority: 4,
        keywords: [newsItem.title, newsItem.source, newsItem.date, "news", "update"],
        answer: `${newsItem.title}. Source: ${newsItem.source}. Date: ${newsItem.date}.`,
      }),
    );
  }

  return entries;
}

function latestVisitorMessage(messages: ChatMessageInput[]) {
  return [...messages].reverse().find((message) => message.role === "visitor")?.text.trim() ?? "";
}

function isGreeting(message: string) {
  return /^(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(message.trim());
}

function scoreEntry(query: string, queryTokens: string[], candidate: KnowledgeEntry) {
  const normalizedQuery = normalizeText(query);
  let score = candidate.priority;

  for (const token of queryTokens) {
    if (candidate.searchText.includes(` ${token} `) || candidate.searchText.startsWith(`${token} `) || candidate.searchText.endsWith(` ${token}`)) {
      score += 4;
    }
  }

  for (const keyword of candidate.keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedKeyword && normalizedQuery.includes(normalizedKeyword)) {
      score += 10;
    }
  }

  const normalizedTitle = normalizeText(candidate.title);
  if (normalizedTitle && normalizedQuery.includes(normalizedTitle)) {
    score += 18;
  }

  return score;
}

function fallbackAnswer(content: SiteContent, query: string): WebsiteChatbotAnswer {
  return {
    confidence: "low",
    matchedTopics: [],
    answer: sanitizeDisplayText(
      `I can answer from the AIXCO website about the AIXCO 6% Bond, Batumi apartments, Dubai funds, broker and developer onboarding, partners, FAQs, and contact details. I do not have enough website content to answer "${query}" precisely. Please add a little more context, or contact ${content.company.email} for the AIXCO team.`,
    ),
  };
}

function maybeContactAnswer(content: SiteContent, query: string): WebsiteChatbotAnswer | null {
  const normalized = normalizeText(query);
  if (!/\b(contact|email|address|representative|human|agent|team)\b/.test(normalized)) return null;

  return {
    confidence: "high",
    matchedTopics: ["Contact AIXCO"],
    answer: sanitizeDisplayText(
      `You can contact AIXCO at ${content.company.email}. The listed address is ${content.company.address}. If you want follow-up, include your role, budget, preferred route, timeline, and project interest in the transcript.`,
    ),
  };
}

function requiresHumanAdvisory(query: string) {
  const normalized = normalizeText(query);
  return (
    /\b(canada|usa|united states|uk|personal tax|tax result|tax advice|legal advice|financial advice)\b/.test(normalized) ||
    /\bguarantee my\b/.test(normalized)
  );
}

export function answerWebsiteChat(messages: ChatMessageInput[], content: SiteContent): WebsiteChatbotAnswer {
  const query = latestVisitorMessage(messages);

  if (!query) {
    return {
      confidence: "low",
      matchedTopics: [],
      answer: "Ask me about the AIXCO 6% Bond, Batumi apartments, Dubai projects, broker onboarding, developer partnerships, partners, team, or FAQs.",
    };
  }

  if (isGreeting(query)) {
    return {
      confidence: "high",
      matchedTopics: ["AIXCO website assistant"],
      answer: "Hello. I can answer questions from the AIXCO website about the bond route, Batumi apartments, Dubai funds, broker and developer onboarding, partners, team, FAQs, and contact details.",
    };
  }

  const contactAnswer = maybeContactAnswer(content, query);
  if (contactAnswer) return contactAnswer;
  if (requiresHumanAdvisory(query)) return fallbackAnswer(content, query);

  const queryTokens = tokenize(query);
  const matches = buildWebsiteKnowledgeBase(content)
    .map((candidate) => ({
      candidate,
      score: scoreEntry(query, queryTokens, candidate),
    }))
    .filter((match) => match.score >= 13)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  if (matches.length === 0) return fallbackAnswer(content, query);

  const [primary, ...supporting] = matches;
  const relatedTopics = supporting
    .filter((match) => match.score >= Math.max(13, primary.score * 0.68))
    .map((match) => match.candidate.title)
    .filter((title) => title !== primary.candidate.title)
    .slice(0, 2);

  const related = relatedTopics.length > 0 ? ` Related on the site: ${relatedTopics.join("; ")}.` : "";
  const nextStep =
    primary.candidate.section === "participation" || primary.candidate.section === "journey" || primary.candidate.section === "faq"
      ? " For next steps, use Register or send the transcript so the AIXCO team can follow up."
      : "";

  return {
    confidence: primary.score >= 24 ? "high" : "medium",
    matchedTopics: uniqueItems([primary.candidate.title, ...relatedTopics]),
    answer: `${primary.candidate.answer}${related}${nextStep}`,
  };
}
