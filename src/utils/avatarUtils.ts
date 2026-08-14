/**
 * Avatar & Initials Utility
 * Implements strict initial generation logic and color styling for profile avatars.
 */

export interface AvatarColorPalette {
  bg: string;
  text: string;
  border: string;
  subtleBg: string;
  subtleText: string;
}

/**
 * Extracts uppercase initials from a full name based on the specified rules:
 * - First name + last name → first letter of each.
 * - Single name → first letter only.
 * - "Salmaan Fitah" → SF
 * - "Ahmed Hassan Mohamed" → AM
 * - "Fatima Ali" → FA
 * - "Mohamed" → M
 * - Converts letters to uppercase and ignores extra whitespace.
 */
export function getInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return '?';

  const cleanName = name.trim().replace(/\s+/g, ' ');
  if (!cleanName) return '?';

  const parts = cleanName.split(' ').filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  // First name + last name -> first letter of each
  const firstInitial = parts[0].charAt(0).toUpperCase();
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();

  return `${firstInitial}${lastInitial}`;
}

/**
 * Determines whether the given avatar string is a real uploaded/custom photo
 * (e.g. data:image URL, blob URL, or external HTTP/HTTPS image URL) vs empty or initials-marker.
 */
export function isCustomPhoto(avatar?: string | null): boolean {
  if (!avatar || typeof avatar !== 'string') return false;
  const trimmed = avatar.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('initials:')) return false;

  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  );
}

/**
 * Soft light-blue circular avatar palette matching the reference image.
 * Features:
 * - Soft light-blue circular background (#e0f2fe / #e2eefb)
 * - Darker blue text color (#1e3a8a / #1e40af) for high legibility & strong contrast
 * - Clean, modern sans-serif typography
 */
export function getAvatarColorPalette(_name?: string): AvatarColorPalette {
  return {
    bg: 'bg-sky-100',
    text: 'text-sky-900',
    border: 'border-sky-200/60',
    subtleBg: '#e0f2fe',
    subtleText: '#1e3a8a',
  };
}

/**
 * Generates an SVG Data URI for an initials avatar.
 * Useful for PDF exports, printouts, or img tags.
 */
export function generateInitialsAvatarSvgDataUrl(name: string, size = 120): string {
  const initials = getInitials(name);
  const palette = getAvatarColorPalette(name);

  // SVG representation: perfect circle, soft light-blue fill, centered dark-blue uppercase text
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${palette.subtleBg}" />
      <text
        x="50%"
        y="52%"
        dominant-baseline="central"
        text-anchor="middle"
        fill="${palette.subtleText}"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        font-size="${Math.round(size * 0.42)}px"
        font-weight="700"
        letter-spacing="0.5px"
      >${initials}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
