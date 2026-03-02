/**
 * Parse a DD/MM/YYYY date string into year, month, day parts.
 * Returns null if the string is empty or invalid.
 */
function parseDMY(
  date: string,
): { year: number; month: number; day: number } | null {
  if (!date || date.trim() === "") return null;
  const parts = date.split("/");
  if (parts.length !== 3) return null;
  const day = Number.parseInt(parts[0], 10);
  const month = Number.parseInt(parts[1], 10);
  const year = Number.parseInt(parts[2], 10);
  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year))
    return null;
  return { day, month, year };
}

/**
 * Calculate difference between two DD/MM/YYYY dates.
 * Returns "Xy Zm" format, e.g. "5y 3m"
 * Add 1 month only if end.day > start.day (NOT equal)
 */
export function getDateDiff(d1: string, d2: string): string {
  const start = parseDMY(d1);
  const end = parseDMY(d2);
  if (!start || !end) return "N/A";

  // Total months
  let totalMonths = (end.year - start.year) * 12 + (end.month - start.month);

  // Add 1 month only if end.day > start.day (not equal)
  if (end.day > start.day) {
    totalMonths += 1;
  }

  if (totalMonths < 0) return "0y 0m";

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return `${years}y ${months}m`;
}

/**
 * Calculate years between two DD/MM/YYYY dates.
 */
export function getYearsBetween(d1: string, d2: string): number {
  const start = parseDMY(d1);
  const end = parseDMY(d2);
  if (!start || !end) return 0;
  let years = end.year - start.year;
  // Adjust if we haven't passed the anniversary yet
  if (
    end.month < start.month ||
    (end.month === start.month && end.day < start.day)
  ) {
    years -= 1;
  }
  return years;
}

/**
 * Format a DD/MM/YYYY date to "DD Mon YYYY" for display, e.g. "14 Feb 1975"
 */
export function formatDate(date: string): string {
  const parsed = parseDMY(date);
  if (!parsed) return date || "—";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${String(parsed.day).padStart(2, "0")} ${months[parsed.month - 1]} ${parsed.year}`;
}

/**
 * Compare two DD/MM/YYYY dates. Returns negative if d1 < d2, 0 if equal, positive if d1 > d2.
 */
export function compareDates(d1: string, d2: string): number {
  const a = parseDMY(d1);
  const b = parseDMY(d2);
  if (!a || !b) return 0;
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}
