export type StayPeriod = { id: number; arrival: string; departure: string };

type DateInterval = { start: number; end: number };

const DAY_MS = 86_400_000;

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return timestamp;
}

function subtractTwelveCalendarMonths(date: Date) {
  const targetYear = date.getUTCFullYear() - 1;
  const targetMonth = date.getUTCMonth();
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return Date.UTC(targetYear, targetMonth, Math.min(date.getUTCDate(), lastDay)) + DAY_MS;
}

function mergeIntervals(intervals: DateInterval[]) {
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  return sorted.reduce<DateInterval[]>((merged, interval) => {
    const previous = merged.at(-1);
    if (!previous || interval.start > previous.end + DAY_MS) {
      merged.push({ ...interval });
    } else {
      previous.end = Math.max(previous.end, interval.end);
    }
    return merged;
  }, []);
}

function countDaysInWindow(intervals: DateInterval[], start: number, end: number) {
  return intervals.reduce((total, interval) => {
    const overlapStart = Math.max(start, interval.start);
    const overlapEnd = Math.min(end, interval.end);
    return overlapStart <= overlapEnd ? total + Math.floor((overlapEnd - overlapStart) / DAY_MS) + 1 : total;
  }, 0);
}

export function calculateBestWindow(stays: StayPeriod[], taxYear: number) {
  const validIntervals = stays.flatMap<DateInterval>((stay) => {
    const start = parseIsoDate(stay.arrival);
    const end = parseIsoDate(stay.departure);
    return start !== null && end !== null && end >= start ? [{ start, end }] : [];
  });
  const intervals = mergeIntervals(validIntervals);
  if (!intervals.length) return { days: 0, start: null as number | null, end: null as number | null };

  const yearStart = Date.UTC(taxYear, 0, 1);
  const yearEnd = Date.UTC(taxYear, 11, 31);
  let best = { days: 0, start: null as number | null, end: null as number | null };

  for (let end = yearStart; end <= yearEnd; end += DAY_MS) {
    const start = subtractTwelveCalendarMonths(new Date(end));
    const days = countDaysInWindow(intervals, start, end);
    if (days > best.days) best = { days, start, end };
  }
  return best;
}

export function isValidStay(stay: StayPeriod) {
  const arrival = parseIsoDate(stay.arrival);
  const departure = parseIsoDate(stay.departure);
  return arrival !== null && departure !== null && departure >= arrival;
}

export function isBackwardsStay(stay: StayPeriod) {
  const arrival = parseIsoDate(stay.arrival);
  const departure = parseIsoDate(stay.departure);
  return arrival !== null && departure !== null && departure < arrival;
}
