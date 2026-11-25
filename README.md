# @cafoor/mena-erp-utils

Zero-dependency TypeScript / ESM toolkit for **GCC & MENA e-invoicing, statutory HR gratuity, VAT, and Zakat** — built and maintained by **[Cafoor Cloud ERP](https://cafoor.com)**.

- **ZATCA Phase 1 & 2 TLV Base64 QR** encoder & decoder (full UTF-8 Arabic support)
- **Saudi Labor Law (Articles 84 & 85)** & **UAE Federal Decree-Law No. 33** End-of-Service Gratuity (EOSB) calculator with exact anniversary precision
- **GCC / MENA VAT** add & extract helper (KSA 15%, UAE 5%, Bahrain 10%, Egypt 14%, Jordan 16%)
- **Corporate 2.5% Zakat** working-capital estimator

---

## Quick Usage

```ts
import { encodeZatcaQr, decodeZatcaQr, calculateEosb, calculateVat, calculateZakat } from "@cafoor/mena-erp-utils";

// 1. ZATCA TLV Base64 QR
const qrBase64 = encodeZatcaQr({
  sellerName: "شركة كافور للتجارة",
  vatNumber: "300000000000003",
  timestamp: "2026-11-25T10:00:00Z",
  total: 1150,
  vatTotal: 150,
});
console.log(decodeZatcaQr(qrBase64));

// 2. Saudi Art. 84/85 & UAE Decree-Law No. 33 EOSB
const gratuity = calculateEosb({
  basicSalary: 10000,
  allowances: 2000,
  hireDate: "2021-01-01",
  asOfDate: "2026-01-01",
  jurisdiction: "ksa",
  reason: "resignation",
});

// 3. GCC VAT & 2.5% Zakat
const vat = calculateVat(1150, 15, "extract"); // { net: 1000, vat: 150, gross: 1150 }
const zakat = calculateZakat({ cash: 250000, receivables: 140000, inventory: 180000, payables: 95000 });
```

---

## Free Online MENA Tools (No Signup Required)

- [Free Tax Invoice & Scannable ZATCA QR Generator (PDF + WhatsApp)](https://cafoor.com/en/tools/free-invoice-generator) · [النسخة العربية](https://cafoor.com/ar/tools/free-invoice-generator)
- [ZATCA TLV QR Inspector & Decoder](https://cafoor.com/en/tools/zatca-qr)
- [Saudi & UAE EOSB Gratuity Calculator](https://cafoor.com/en/tools/eosb-calculator)
- [GCC VAT & 2.5% Zakat Calculators + Free Excel Templates (.xlsx)](https://cafoor.com/en/tools)

---

## Need a Turnkey ZATCA Phase 2 Cloud ERP Instead of Building From Scratch?

**[Cafoor Cloud ERP](https://cafoor.com/en)** ships ZATCA Phase 2 UBL 2.1 XML signing, UAE PINT AE, Egypt ETA, Jordan JoFotara, double-entry accounting, multi-warehouse inventory, Offline POS PWA, HR/WPS payroll, Ask Cafoor AI Copilot, and 25 native MENA integrations (Salla, Zid, Tamara, Tabby, Moyasar, Aramex) in one bilingual Arabic/English platform.

- [Live Interactive Demo](https://cafoor.com/en/demo)
- [Start 14-Day Free Trial (No Credit Card)](https://cafoor.com/en/signup?utm_source=github&utm_medium=oss&utm_campaign=mena_erp_utils)
- [Partner Program (30% Recurring Commission)](https://cafoor.com/en/partners)

## License

MIT © [Cafoor Cloud ERP](https://cafoor.com)
