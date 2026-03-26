/**
 * Cameroon Tax Constants and Utilities
 * Conformité fiscale camerounaise
 */

export const CAMEROON_TAX = {
  // TVA - Taxe sur la Valeur Ajoutée
  TVA_RATE: 0.1925, // 19.25%

  // IS - Impôt sur les Sociétés
  IS_RATE: 0.33, // 33%

  // Patente (taxe professionnelle)
  PATENTE_BASE: 50000, // FCFA de base

  // Retenue à la Source
  RETENUE_SOURCE: 0.055, // 5.5%

  // TSR - Taxe Spéciale sur les Revenus
  TSR: 0.03, // 3%

  // IRPP - Impôt sur le Revenu des Personnes Physiques
  // Barème progressif simplifié
  IRPP_TRANCHES: [
    { min: 0, max: 2000000, rate: 0 },
    { min: 2000000, max: 3000000, rate: 0.1 },
    { min: 3000000, max: 5000000, rate: 0.165 },
    { min: 5000000, max: 10000000, rate: 0.275 },
    { min: 10000000, max: Infinity, rate: 0.385 },
  ],

  // Seuil d'assujettissement à la TVA
  TVA_THRESHOLD: 50000000, // 50 millions FCFA

  // Délais de déclaration (jours)
  TVA_DEADLINE: 15, // 15ème jour du mois suivant
  IS_DEADLINE: 31, // 31 mars de l'année suivante
};

/**
 * Calculate TVA amount from HT (Hors Taxes) amount
 */
export function calculateTVA(amountHT: number): number {
  return amountHT * CAMEROON_TAX.TVA_RATE;
}

/**
 * Calculate amount HT from TTC (Toutes Taxes Comprises)
 */
export function calculateHTfromTTC(amountTTC: number): number {
  return amountTTC / (1 + CAMEROON_TAX.TVA_RATE);
}

/**
 * Calculate IS (Impôt sur les Sociétés) from annual profit
 */
export function calculateIS(profit: number): number {
  if (profit <= 0) return 0;
  return profit * CAMEROON_TAX.IS_RATE;
}

/**
 * Calculate Retenue à la Source
 */
export function calculateRetenueSource(amount: number): number {
  return amount * CAMEROON_TAX.RETENUE_SOURCE;
}

/**
 * Calculate TSR (Taxe Spéciale sur les Revenus)
 */
export function calculateTSR(revenue: number): number {
  return revenue * CAMEROON_TAX.TSR;
}

/**
 * Calculate IRPP with progressive tax brackets
 */
export function calculateIRPP(annualIncome: number): number {
  let tax = 0;
  let remainingIncome = annualIncome;

  for (const tranche of CAMEROON_TAX.IRPP_TRANCHES) {
    if (remainingIncome <= 0) break;

    const taxableInTranche =
      tranche.max === Infinity
        ? remainingIncome
        : Math.min(remainingIncome, tranche.max - tranche.min);

    tax += taxableInTranche * tranche.rate;
    remainingIncome -= taxableInTranche;
  }

  return tax;
}

/**
 * Calculate Patente (professional tax)
 */
export function calculatePatente(revenue: number): number {
  // Simplified calculation - base + percentage of revenue
  const base = CAMEROON_TAX.PATENTE_BASE;
  const variablePart = revenue * 0.005; // 0.5% of revenue
  return base + variablePart;
}

/**
 * Calculate invoice total with optional TVA
 */
export function calculateInvoiceTotal(
  subtotal: number,
  applyTVA: boolean
): {
  subtotal: number;
  tva: number;
  total: number;
} {
  const tva = applyTVA ? calculateTVA(subtotal) : 0;
  return {
    subtotal,
    tva,
    total: subtotal + tva,
  };
}

/**
 * Format amount as FCFA
 */
export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate quarterly TVA declaration
 */
export function calculateQuarterlyTVA(
  revenues: number[],
  expenses: number[]
): {
  collectee: number;
  deductible: number;
  net: number;
} {
  const collectee = revenues.reduce(
    (sum, r) => sum + calculateTVA(r),
    0
  );
  const deductible = expenses.reduce(
    (sum, e) => sum + calculateTVA(e),
    0
  );

  return {
    collectee,
    deductible,
    net: collectee - deductible,
  };
}

/**
 * Get next tax declaration due date
 */
export function getNextTVADueDate(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
  return nextMonth;
}

/**
 * Get tax period label
 */
export function getTaxPeriodLabel(period: string): string {
  const [year, quarter] = period.split("-");
  const quarterLabels: Record<string, string> = {
    Q1: "1er Trimestre",
    Q2: "2ème Trimestre",
    Q3: "3ème Trimestre",
    Q4: "4ème Trimestre",
    "01": "Janvier",
    "02": "Février",
    "03": "Mars",
    "04": "Avril",
    "05": "Mai",
    "06": "Juin",
    "07": "Juillet",
    "08": "Août",
    "09": "Septembre",
    "10": "Octobre",
    "11": "Novembre",
    "12": "Décembre",
  };

  return `${quarterLabels[quarter] || quarter} ${year}`;
}
