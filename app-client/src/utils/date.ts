import { format, formatDistanceToNow, parseISO, differenceInDays, isPast, isValid } from 'date-fns';



type DateInput = Date | string | number

function toDate(value: DateInput): Date {
    if (value instanceof Date) return value;
    if (typeof value === 'string') return parseISO(value);
    return new Date(value);
}

/**
 * Formats a date into a readable string.
 * @param value  - Date, ISO string, or timestamp
 * @param pattern - date-fns format pattern (default: "dd MMM yyyy")
 * @returns "14 Mar 2025" | "Invalid date"
 *
 * @example
 * formatDate("2025-03-14")            // "14 Mar 2025"
 * formatDate(new Date(), "MM/dd/yy")  // "03/14/25"
 */
export function formatDate(value: DateInput, pattern = 'dd MMM yyyy'): string {
    const date = toDate(value);
    if (!isValid(date)) return 'Invalid date';
    return format(date, pattern);
}

/**
 * Returns a human-readable relative time string.
 * @param value - Date, ISO string, or timestamp
 * @returns "2 hours ago" | "3 days ago"
 *
 * @example
 * formatRelative("2025-03-12T10:00:00Z") // "2 days ago"
 */
export function formatRelative(value: DateInput): string {
    const date = toDate(value);
    if (!isValid(date)) return 'Invalid date';
    return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Parses an ISO string or timestamp into a Date object.
 * Returns null if the value is invalid.
 *
 * @example
 * parseDate("2025-03-14T00:00:00Z") // Date object
 * parseDate("not-a-date")           // null
 */
export function parseDate(value: string | number): Date | null {
    const date = typeof value === 'string' ? parseISO(value) : new Date(value);
    return isValid(date) ? date : null;
}

/**
 * Returns the number of full days between two dates.
 * Positive if `from` is before `to`, negative if after.
 *
 * @example
 * getDiffDays("2025-03-01", "2025-03-14") // 13
 */
export function getDiffDays(from: DateInput, to: DateInput): number {
    return differenceInDays(toDate(to), toDate(from));
}

/**
 * Returns true if the given date is in the past.
 *
 * @example
 * isExpired("2023-01-01") // true
 * isExpired("2099-01-01") // false
 */
export function isExpired(value: DateInput): boolean {
    const date = toDate(value);
    if (!isValid(date)) return false;
    return isPast(date);
}
