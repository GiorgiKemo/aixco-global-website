export const ADMIN_ANALYTICS_PAGE_SIZE = 6;

export type AnalyticsPaginationKey = "sessions" | "errors" | "audit";

export type AnalyticsListPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  start: number;
  end: number;
  startIndex: number;
  endIndex: number;
};

export type AnalyticsPaginationState = Record<AnalyticsPaginationKey, AnalyticsListPagination>;

export type AnalyticsPaginationPages = Record<AnalyticsPaginationKey, number>;

const pageParamByKey: Record<AnalyticsPaginationKey, string> = {
  sessions: "sessionsPage",
  errors: "errorsPage",
  audit: "auditPage",
};

export function parseAnalyticsPage(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || !/^\d+$/.test(candidate)) return 1;

  const parsed = Number(candidate);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function createAnalyticsListPagination(
  total: number,
  requestedPage: number,
  pageSize = ADMIN_ANALYTICS_PAGE_SIZE,
): AnalyticsListPagination {
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const safePageSize = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : ADMIN_ANALYTICS_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));
  const safeRequestedPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const page = Math.min(safeRequestedPage, totalPages);
  const startIndex = safeTotal === 0 ? 0 : (page - 1) * safePageSize;
  const endIndex = Math.min(startIndex + safePageSize, safeTotal);

  return {
    page,
    pageSize: safePageSize,
    total: safeTotal,
    totalPages,
    start: safeTotal === 0 ? 0 : startIndex + 1,
    end: endIndex,
    startIndex,
    endIndex,
  };
}

export function createAnalyticsPaginationState({
  totals,
  requestedPages,
}: {
  totals: Record<AnalyticsPaginationKey, number>;
  requestedPages: AnalyticsPaginationPages;
}): AnalyticsPaginationState {
  return {
    sessions: createAnalyticsListPagination(totals.sessions, requestedPages.sessions),
    errors: createAnalyticsListPagination(totals.errors, requestedPages.errors),
    audit: createAnalyticsListPagination(totals.audit, requestedPages.audit),
  };
}

export function sliceAnalyticsPage<T>(items: T[], pagination: AnalyticsListPagination) {
  return items.slice(pagination.startIndex, pagination.endIndex);
}

export function buildAnalyticsPaginationHref({
  range,
  focus,
  pages,
  target,
  page,
}: {
  range: string;
  focus: string;
  pages: AnalyticsPaginationPages;
  target: AnalyticsPaginationKey;
  page: number;
}) {
  const query = new URLSearchParams({ range, focus });
  const nextPages = { ...pages, [target]: page };

  (Object.keys(pageParamByKey) as AnalyticsPaginationKey[]).forEach((key) => {
    if (nextPages[key] > 1) query.set(pageParamByKey[key], String(nextPages[key]));
  });

  return `/admin/analytics?${query.toString()}`;
}
