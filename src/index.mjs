/**
 * @cafoor/mena-erp-utils — Zero-dependency GCC & MENA ERP utilities
 * Maintained by Cafoor Cloud ERP (https://cafoor.com)
 */

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", { fatal: false });

/**
 * Encode Saudi ZATCA Phase 1 / Phase 2 Tag-Length-Value (TLV) fields into Base64.
 * Supports Tags 1-5 (Phase 1) and optional Tags 6-9 (Phase 2 cryptographic stamp fields).
 */
export function encodeZatcaQr(input) {
  const tags = [
    [1, String(input.sellerName ?? "")],
    [2, String(input.vatNumber ?? "")],
    [3, String(input.timestamp ?? "")],
    [4, typeof input.total === "number" ? input.total.toFixed(2) : String(input.total ?? "0.00")],
    [5, typeof input.vatTotal === "number" ? input.vatTotal.toFixed(2) : String(input.vatTotal ?? "0.00")],
  ];
  if (input.xmlHash) tags.push([6, String(input.xmlHash)]);
  if (input.ecdsaSignature) tags.push([7, String(input.ecdsaSignature)]);
  if (input.publicKey) tags.push([8, String(input.publicKey)]);
  if (input.stampSignature) tags.push([9, String(input.stampSignature)]);

  const chunks = [];
  for (const [tag, value] of tags) {
    const bytes = textEncoder.encode(value);
    if (bytes.length > 255) {
      throw new RangeError(`ZATCA TLV tag ${tag} exceeds 255 UTF-8 bytes`);
    }
    chunks.push(tag, bytes.length, ...bytes);
  }
  return Buffer.from(chunks).toString("base64");
}

/**
 * Decode a Saudi ZATCA Base64 TLV QR string back into structured fields.
 */
export function decodeZatcaQr(base64) {
  const buf = Buffer.from(String(base64 ?? "").trim(), "base64");
  const fields = [];
  for (let i = 0; i < buf.length; ) {
    const tag = buf[i++];
    if (i >= buf.length) break;
    const len = buf[i++];
    const slice = buf.subarray(i, i + len);
    i += len;
    fields.push({ tag, value: textDecoder.decode(slice) });
  }
  const byTag = Object.fromEntries(fields.map((f) => [f.tag, f.value]));
  return {
    sellerName: byTag[1] ?? "",
    vatNumber: byTag[2] ?? "",
    timestamp: byTag[3] ?? "",
    total: byTag[4] ?? "",
    vatTotal: byTag[5] ?? "",
    fields,
  };
}

/**
 * Calculate statutory End-of-Service Gratuity (EOSB) for Saudi Arabia (Labor Law Art. 84 & 85)
 * and UAE (Federal Decree-Law No. 33 of 2021).
 */
export function calculateEosb({
  basicSalary,
  allowances = 0,
  hireDate,
  asOfDate = new Date().toISOString().slice(0, 10),
  jurisdiction = "ksa",
  reason = "termination",
}) {
  const start = new Date(`${hireDate}T00:00:00Z`).getTime();
  const end = new Date(`${asOfDate}T00:00:00Z`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return { serviceYears: 0, baseWage: 0, factor: 0, payout: 0 };
  }

  // Exact calendar-year anniversary awareness (prevents 365.25 leap-year boundary bugs)
  const dStart = new Date(`${hireDate}T00:00:00Z`);
  const dEnd = new Date(`${asOfDate}T00:00:00Z`);
  let wholeYears = dEnd.getUTCFullYear() - dStart.getUTCFullYear();
  const anniv = new Date(Date.UTC(dStart.getUTCFullYear() + wholeYears, dStart.getUTCMonth(), dStart.getUTCDate()));
  if (dEnd < anniv) wholeYears -= 1;
  const lastAnniv = new Date(Date.UTC(dStart.getUTCFullYear() + wholeYears, dStart.getUTCMonth(), dStart.getUTCDate()));
  const nextAnniv = new Date(Date.UTC(dStart.getUTCFullYear() + wholeYears + 1, dStart.getUTCMonth(), dStart.getUTCDate()));
  const serviceYears = Math.max(0, wholeYears + (dEnd.getTime() - lastAnniv.getTime()) / (nextAnniv.getTime() - lastAnniv.getTime()));

  const basic = Math.max(0, Number(basicSalary) || 0);
  const allow = Math.max(0, Number(allowances) || 0);

  if (jurisdiction === "uae") {
    if (serviceYears < 1) return { serviceYears, baseWage: basic, factor: 0, payout: 0 };
    const first5 = Math.min(5, serviceYears) * ((21 / 30) * basic);
    const over5 = Math.max(0, serviceYears - 5) * basic;
    const capped = Math.min(first5 + over5, basic * 24);
    return { serviceYears, baseWage: basic, factor: 1, payout: Math.round(capped * 100) / 100 };
  }

  // Saudi Arabia (Art. 84 & Art. 85)
  const baseWage = basic + allow;
  const fullGratuity = Math.min(5, serviceYears) * 0.5 * baseWage + Math.max(0, serviceYears - 5) * baseWage;
  let factor = 1;
  if (reason === "resignation") {
    if (serviceYears < 2) factor = 0;
    else if (serviceYears < 5) factor = 1 / 3;
    else if (serviceYears < 10) factor = 2 / 3;
    else factor = 1;
  }
  return {
    serviceYears,
    baseWage,
    factor,
    payout: Math.round(fullGratuity * factor * 100) / 100,
  };
}

/**
 * Add or extract GCC / MENA VAT (KSA 15%, UAE 5%, Bahrain 10%, Egypt 14%, Jordan 16%).
 */
export function calculateVat(amount, ratePct = 15, mode = "add") {
  const clean = Math.max(0, Number(amount) || 0);
  const rate = Math.max(0, Number(ratePct) || 0) / 100;
  if (mode === "extract") {
    const net = clean / (1 + rate);
    const vat = clean - net;
    return {
      net: Math.round(net * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      gross: Math.round(clean * 100) / 100,
    };
  }
  const vat = clean * rate;
  return {
    net: Math.round(clean * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    gross: Math.round((clean + vat) * 100) / 100,
  };
}

/**
 * Estimate 2.5% Corporate Zakat from net working capital.
 */
export function calculateZakat({ cash = 0, receivables = 0, inventory = 0, payables = 0 }) {
  const zakatBase = Math.max(
    0,
    (Number(cash) || 0) + (Number(receivables) || 0) + (Number(inventory) || 0) - (Number(payables) || 0),
  );
  return {
    zakatBase: Math.round(zakatBase * 100) / 100,
    zakatDue: Math.round(zakatBase * 0.025 * 100) / 100,
  };
}
