export interface ZatcaQrInput {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  total: number | string;
  vatTotal: number | string;
  xmlHash?: string;
  ecdsaSignature?: string;
  publicKey?: string;
  stampSignature?: string;
}

export interface ZatcaQrDecoded {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  total: string;
  vatTotal: string;
  fields: Array<{ tag: number; value: string }>;
}

export function encodeZatcaQr(input: ZatcaQrInput): string;
export function decodeZatcaQr(base64: string): ZatcaQrDecoded;

export interface EosbInput {
  basicSalary: number;
  allowances?: number;
  hireDate: string;
  asOfDate?: string;
  jurisdiction?: "ksa" | "uae";
  reason?: "termination" | "resignation";
}

export interface EosbResult {
  serviceYears: number;
  baseWage: number;
  factor: number;
  payout: number;
}

export function calculateEosb(input: EosbInput): EosbResult;
export function calculateVat(amount: number, ratePct?: number, mode?: "add" | "extract"): { net: number; vat: number; gross: number };
export function calculateZakat(input: { cash?: number; receivables?: number; inventory?: number; payables?: number }): { zakatBase: number; zakatDue: number };
