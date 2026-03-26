/**
 * Currency utilities for Cameroonian SME Finance App
 * Supports XAF (FCFA), EUR, USD
 */

export const CURRENCIES = {
  XAF: {
    code: "XAF",
    symbol: "FCFA",
    name: "Franc CFA BEAC",
    locale: "fr-CM",
    decimals: 0,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "fr-FR",
    decimals: 2,
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "Dollar américain",
    locale: "en-US",
    decimals: 2,
  },
};

// Default exchange rates (fallback when API not available)
// Rates relative to XAF
export const DEFAULT_RATES: Record<string, number> = {
  XAF: 1,
  EUR: 655.957, // 1 EUR = 655.957 XAF (fixed rate - CFA franc pegged to Euro)
  USD: 615.0, // Approximate rate
};

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number> = DEFAULT_RATES
): number {
  if (from === to) return amount;

  // Convert to XAF first (base currency)
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;

  const amountInXAF = from === "XAF" ? amount : amount * fromRate;
  const result = to === "XAF" ? amountInXAF : amountInXAF / toRate;

  return result;
}

/**
 * Format amount as currency string
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = "XAF"
): string {
  const currency = CURRENCIES[currencyCode as keyof typeof CURRENCIES];

  if (!currency) {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }

  if (currencyCode === "XAF") {
    // French-Cameroonian format: 1 000 000 FCFA
    return (
      new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Math.round(amount)) + " FCFA"
    );
  }

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(amount);
}

/**
 * Format number with currency symbol prefix
 */
export function formatWithSymbol(
  amount: number,
  currencyCode: string = "XAF"
): string {
  const currency = CURRENCIES[currencyCode as keyof typeof CURRENCIES];
  if (!currency) return formatCurrency(amount, currencyCode);

  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(amount);

  if (currencyCode === "XAF") {
    return `${formatted} FCFA`;
  } else if (currencyCode === "EUR") {
    return `${formatted} €`;
  } else {
    return `$${formatted}`;
  }
}

/**
 * Parse a currency string to number
 */
export function parseCurrencyString(value: string): number {
  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/**
 * Get currency display info
 */
export function getCurrencyInfo(code: string) {
  return CURRENCIES[code as keyof typeof CURRENCIES] || null;
}

/**
 * Format amount compactly for KPI cards
 */
export function formatCompact(amount: number, currency: string = "XAF"): string {
  const absAmount = Math.abs(amount);

  if (absAmount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}G FCFA`;
  } else if (absAmount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M FCFA`;
  } else if (absAmount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K FCFA`;
  }

  return formatCurrency(amount, currency);
}

/**
 * All currency codes list
 */
export const CURRENCY_CODES = Object.keys(CURRENCIES) as Array<
  keyof typeof CURRENCIES
>;
