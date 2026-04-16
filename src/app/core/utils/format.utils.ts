export function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '0';
  return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatCurrency(
  value: number,
  currency: string = 'INR',
  locale: string = 'en-IN',
): string {
  if (isNaN(value)) return '';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${formatNumber(value)}`;
  }
}

export function formatPercentage(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatPhoneNumber(phone: string, countryCode: string = '+91'): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `${countryCode} ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }

  if (cleaned.length === 12) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
}

export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function titleCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function camelCase(text: string): string {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

export function snakeCase(text: string): string {
  if (!text) return '';
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
}

export function kebabCase(text: string): string {
  if (!text) return '';
  return text
    .replace(/\W+/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

export function pascalCase(text: string): string {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function initials(name: string, maxLength: number = 2): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, maxLength).toUpperCase();
  }

  return parts
    .slice(0, maxLength)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;

  const [username, domain] = email.split('@');
  const visibleChars = Math.min(3, Math.floor(username.length / 2));
  const maskedUsername = username.substring(0, visibleChars) + '***';

  return `${maskedUsername}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return '****';

  return `****${cleaned.slice(-4)}`;
}

export function maskAadhar(aadhar: string): string {
  if (!aadhar) return '';

  const cleaned = aadhar.replace(/\D/g, '');
  if (cleaned.length !== 12) return aadhar;

  return `**** **** **** ${cleaned.slice(-4)}`;
}

export function maskPAN(pan: string): string {
  if (!pan) return '';

  if (pan.length !== 10) return pan;

  return `${pan.substring(0, 5)}****${pan.substring(9)}`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}

export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function unescapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
  };
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, (m) => map[m]);
}
