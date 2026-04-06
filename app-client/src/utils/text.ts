/**
 * Truncates a string to a max length and appends an ellipsis if cut.
 * @param text     - Input string
 * @param maxLen   - Maximum character length
 * @param ellipsis - Suffix when truncated (default: "…")
 * @returns Truncated string
 *
 * @example
 * truncate("Hello World", 7)        // "Hello W…"
 * truncate("Hello World", 7, "...") // "Hello W..."
 * truncate("Hi", 10)                // "Hi"
 */
export function truncate(text: string, maxLen: number, ellipsis = '…'): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + ellipsis;
}

/**
 * Capitalizes the first letter of a string.
 *
 * @example
 * capitalize("hello world") // "Hello world"
 */
export function capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Converts a camelCase or PascalCase string to a Title Case label.
 *
 * @example
 * camelToTitle("firstName")     // "First Name"
 * camelToTitle("getUserById")   // "Get User By Id"
 */
export function camelToTitle(text: string): string {
    return text
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (c) => c.toUpperCase())
        .trim();
}

/**
 * Converts a string to a URL-safe slug.
 * Lowercases, strips special characters, and replaces spaces with hyphens.
 *
 * @example
 * slugify("Hello World!")         // "hello-world"
 * slugify("  React & TypeScript") // "react-typescript"
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Masks an email address to protect user privacy in the UI.
 * Keeps the first 2 characters and the domain visible.
 *
 * @example
 * maskEmail("kiran@example.com")  // "ki***@example.com"
 * maskEmail("ab@test.io")         // "ab***@test.io"
 */
export function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const visible = local.slice(0, 2);
    return `${visible}***@${domain}`;
}
