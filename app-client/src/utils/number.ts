/**
 * Formats a number as a currency string.
 * @param value    - The number to format
 * @param currency - ISO 4217 currency code (default: "USD")
 * @param locale   - BCP 47 locale string (default: "en-US")
 * @returns "$1,234.56"
 *
 * @example
 * formatCurrency(1234.5)              // "$1,234.50"
 * formatCurrency(1234.5, "INR", "en-IN") // "₹1,234.50"
 */
export function formatCurrency(value: number, currency = 'USD', locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Formats a decimal as a percentage string.
 * @param value      - Decimal value (0.25 = 25%)
 * @param decimals   - Number of decimal places (default: 1)
 * @returns "25.0%"
 *
 * @example
 * formatPercent(0.253)    // "25.3%"
 * formatPercent(0.253, 0) // "25%"
 */
export function formatPercent(value: number, decimals = 1): string {
    return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Abbreviates large numbers with K / M / B suffixes.
 * @param value    - The number to abbreviate
 * @param decimals - Decimal places to show (default: 1)
 * @returns "1.2K" | "3.4M" | "5.6B"
 *
 * @example
 * abbreviateNumber(1500)        // "1.5K"
 * abbreviateNumber(1_200_000)   // "1.2M"
 * abbreviateNumber(999)         // "999"
 */
export function abbreviateNumber(value: number, decimals = 1): string {
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(decimals)}B`;
    if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(decimals)}M`;
    if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(decimals)}K`;

    return `${value}`;
}

/**
 * Clamps a number between a minimum and maximum value.
 *
 * @example
 * clamp(150, 0, 100) // 100
 * clamp(-5,  0, 100) // 0
 * clamp(42,  0, 100) // 42
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Rounds a number to a given number of decimal places.
 *
 * @example
 * roundTo(3.14159, 2) // 3.14
 * roundTo(1.005, 2)   // 1.01
 */
export function roundTo(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}
