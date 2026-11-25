import test from "node:test";
import assert from "node:assert/strict";
import { encodeZatcaQr, decodeZatcaQr, calculateEosb, calculateVat, calculateZakat } from "../src/index.mjs";

test("ZATCA TLV QR round-trip supports UTF-8 Arabic seller names", () => {
  const b64 = encodeZatcaQr({
    sellerName: "شركة كافور للتجارة",
    vatNumber: "300000000000003",
    timestamp: "2026-11-25T10:00:00Z",
    total: 1150,
    vatTotal: 150,
  });
  const dec = decodeZatcaQr(b64);
  assert.equal(dec.sellerName, "شركة كافور للتجارة");
  assert.equal(dec.vatNumber, "300000000000003");
  assert.equal(dec.total, "1150.00");
  assert.equal(dec.vatTotal, "150.00");
});

test("EOSB calculates exact Saudi Art. 84/85 & UAE Decree-Law No. 33 anniversaries", () => {
  const ksaResign5 = calculateEosb({
    basicSalary: 10000,
    allowances: 2000,
    hireDate: "2021-01-01",
    asOfDate: "2026-01-01",
    jurisdiction: "ksa",
    reason: "resignation",
  });
  assert.equal(ksaResign5.serviceYears, 5);
  assert.equal(ksaResign5.factor, 2 / 3);
  assert.equal(ksaResign5.payout, 20000);

  const uae1 = calculateEosb({
    basicSalary: 10000,
    allowances: 4000,
    hireDate: "2025-01-01",
    asOfDate: "2026-01-01",
    jurisdiction: "uae",
  });
  assert.equal(uae1.serviceYears, 1);
  assert.equal(uae1.payout, 7000);
});

test("GCC VAT & 2.5% Corporate Zakat calculators", () => {
  assert.deepEqual(calculateVat(1000, 15, "add"), { net: 1000, vat: 150, gross: 1150 });
  assert.deepEqual(calculateVat(1150, 15, "extract"), { net: 1000, vat: 150, gross: 1150 });
  assert.deepEqual(calculateZakat({ cash: 250000, receivables: 140000, inventory: 180000, payables: 95000 }), {
    zakatBase: 475000,
    zakatDue: 11875,
  });
});
