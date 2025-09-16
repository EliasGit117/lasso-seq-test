export const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;


export function findEmails(text: string): string[] {
  if (!text)
    return [];

  const found = Array.from(text.matchAll(EMAIL_REGEX), m => m[1]);

  return Array.from(new Set(found.map(e => e.trim().toLowerCase())));
}