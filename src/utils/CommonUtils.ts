export class CommonUtils {
  static generateRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < length; i += 1) {
      const index = Math.floor(Math.random() * chars.length);
      result += chars[index];
    }

    return result;
  }

  static generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getCurrentDate(format: 'YYYY-MM-DD' | 'DD-MM-YYYY' = 'YYYY-MM-DD'): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    if (format === 'DD-MM-YYYY') {
      return `${dd}-${mm}-${yyyy}`;
    }

    return `${yyyy}-${mm}-${dd}`;
  }

  static getFutureDate(days: number, format: 'YYYY-MM-DD' | 'DD-MM-YYYY' = 'YYYY-MM-DD'): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return this.formatDate(date, format);
  }

  static getPastDate(days: number, format: 'YYYY-MM-DD' | 'DD-MM-YYYY' = 'YYYY-MM-DD'): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.formatDate(date, format);
  }

  static addDaysToDate(days: number, format: 'YYYY-MM-DD' | 'DD-MM-YYYY' = 'YYYY-MM-DD'): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return this.formatDate(date, format);
  }

  static safeTrim(value: string | null | undefined): string {
    return (value || '').trim();
  }

  static normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  static toTitleCase(text: string): string {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => (word ? word[0].toUpperCase() + word.slice(1) : ''))
      .join(' ');
  }

  static randomEmail(domain = 'example.com'): string {
    const random = this.generateRandomString(8).toLowerCase();
    return `${random}@${domain}`;
  }

  static formatPhoneNumber(digits: string): string {
    const clean = digits.replace(/\D/g, '').slice(0, 10);
    if (clean.length < 10) {
      return clean;
    }
    return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6, 10)}`;
  }

  private static formatDate(date: Date, format: 'YYYY-MM-DD' | 'DD-MM-YYYY'): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    if (format === 'DD-MM-YYYY') {
      return `${dd}-${mm}-${yyyy}`;
    }

    return `${yyyy}-${mm}-${dd}`;
  }
}
