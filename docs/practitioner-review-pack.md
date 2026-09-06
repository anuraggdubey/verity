# Practitioner review pack

Verity is a merge gate for agent-generated finance work. Before it can claim
anything about accuracy, someone who closes books needs to confirm that the
cases are realistic and that the expected answers are right.

**What we need from you:** for each case below, mark the verdict line
`approved` if our expected disposition and journal are what you would do, or
`corrected` with a note if they are not. A correction is more useful to us
than an approval — it is the whole reason for asking.

Return the filled verdicts as JSON (see the end of this file) and we will
import them with `npm run review:import`.

## Accounting policy in force

- Entity ACME-US, functional currency USD.
- Open periods: 2026-08. Closed: 2026-06, 2026-07.
- Foreign currency: spot rate observed on the invoice transaction date, from APEX-REF-RATES, tolerance 0 day(s).
- Permitted accounts: 1010 Cash — operating; 1200 Accounts receivable; 2100 Accounts payable; 7110 Bank fees; 7420 Realized FX gain/loss; 7900 Suspense — unidentified receipts.
- Non-posting dispositions that may clear without a controller: matched, timing_difference.
- Materiality: immaterial below $500.00, critical at or above $10,000.00.

**Is this policy itself right?** If any line above is not how you would
write it, say so — a wrong policy makes every expected answer wrong too.

---

## CASE-001

EUR 8,000 invoice settled in USD 8,712.00 — FX treatment required

**Bank statement line**

- BL-014 · 2026-08-14 · -$8,712.00
- Counterparty: Lyra GmbH
- Reference: INV-LG-2291
- Description: INTL WIRE EUR INVOICE SETTLEMENT

**Candidate ledger entries**

- GL-2201 · 2026-08-14 · account 2100 · period 2026-08 · $8,628.00 · posted — AP - Lyra GmbH EUR 8,000 invoice at invoice-date carrying value

**Supporting evidence available to the agent**

- DOC-LG-2291 · vendor_invoice · issued 2026-08-11 · €8,000.00 · ref INV-LG-2291 · transactionDate=2026-08-11, terms=NET 3, vatId=DE811907980

**FX observations the agent could see**

- FXO-0811-APX · 1.0785 spot · 2026-08-11 · APEX-REF-RATES
- FXO-0814-STF · 1.089 spot · 2026-08-14 · STREETFX-FEED · NOT policy-approved
- FXO-0814-APX · 1.0871 spot · 2026-08-14 · APEX-REF-RATES
- FXO-0819-APX · 1.0742 spot · 2026-08-19 · APEX-REF-RATES
- FXO-0821-APX · 1.08 spot · 2026-08-21 · APEX-REF-RATES
- FXO-0826-APX · 1.08 spot · 2026-08-26 · APEX-REF-RATES
- FXO-0827-APX · 1.06 spot · 2026-08-27 · APEX-REF-RATES
- FXO-0829-APX · 1.08 spot · 2026-08-29 · APEX-REF-RATES
- FXO-0831-APX · 1.08 closing · 2026-08-31 · APEX-REF-RATES
- FXO-0825-APX · 1.08 spot · 2026-08-25 · APEX-REF-RATES
- FXO-0822-APX · 1.0785 spot · 2026-08-22 · APEX-REF-RATES

**What Verity expects**

- Disposition: `fx_revaluation`
- Routing: `review`
- Journal accounts: `2100`, `7420`, `1010`
- Benchmark split: discovery
- Note: Must use approved transaction-date spot rate 1.0785 and recognize USD 84.00 realized FX loss.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-001: approved | corrected
note:
```

---

## CASE-002

Bank service charge 45.00 with no matching ledger entry — journal proposed

**Bank statement line**

- BL-007 · 2026-08-08 · -$45.00
- Counterparty: First Meridian Bank
- Reference: SVC-AUG
- Description: MONTHLY SERVICE CHARGE

**Supporting evidence available to the agent**

- DOC-FEE-AUG · bank_fee_schedule · issued 2026-08-01 · $45.00 · ref SVC-AUG · feeType=monthly account maintenance, scheduleVersion=2026.01

**What Verity expects**

- Disposition: `bank_fee_journal`
- Routing: `review`
- Journal accounts: `7110`, `1010`
- Benchmark split: discovery


**Your verdict** — replace one word, add a note if corrected:

```
CASE-002: approved | corrected
note:
```

---

## CASE-003

Possible duplicate payment against invoice 3390 — non-posting disposition

**Bank statement line**

- BL-009 · 2026-08-12 · -$3,250.00
- Counterparty: Peakline Supply
- Reference: INV-3390
- Description: ACH DEBIT PEAKLINE SUPPLY

**Candidate ledger entries**

- GL-2210 · 2026-08-11 · account 2100 · period 2026-08 · $3,250.00 · posted — AP - Peakline Supply invoice 3390 (already relieved by GL-2244)
- GL-2244 · 2026-08-12 · account 1010 · period 2026-08 · -$3,250.00 · posted — Cash payment Peakline Supply invoice 3390

**Supporting evidence available to the agent:** none.

**What Verity expects**

- Disposition: `duplicate`
- Routing: `review`
- Journal accounts: none (non-posting)
- Benchmark split: discovery


**Your verdict** — replace one word, add a note if corrected:

```
CASE-003: approved | corrected
note:
```

---

## CASE-004

Incoming wire 12,400.00 with no remittance advice — evidence missing

**Bank statement line**

- BL-011 · 2026-08-13 · $12,400.00
- Counterparty: UNKNOWN REMITTER
- Reference: (none)
- Description: INCOMING WIRE - NO REMITTANCE ADVICE

**Supporting evidence available to the agent:** none.

**What Verity expects**

- Disposition: `insufficient_evidence`
- Routing: `escalate`
- Journal accounts: none (non-posting)
- Benchmark split: discovery
- Note: Correct abstention. Any proposed disposition is wrong.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-004: approved | corrected
note:
```

---

## CASE-005

Check issued 2026-07-29 cleared 2026-08-18 — approved timing difference

**Bank statement line**

- BL-016 · 2026-08-18 · -$6,120.00
- Counterparty: Vantage Freight
- Reference: CHK-10442
- Description: CHECK PAID

**Candidate ledger entries**

- GL-2118 · 2026-07-29 · account 1010 · period 2026-07 · -$6,120.00 · posted — Check 10442 issued July, cleared August

**Supporting evidence available to the agent:** none.

**What Verity expects**

- Disposition: `timing_difference`
- Routing: `auto`
- Journal accounts: none (non-posting)
- Benchmark split: discovery


**Your verdict** — replace one word, add a note if corrected:

```
CASE-005: approved | corrected
note:
```

---

## CASE-006

EUR 5,000 invoice settled in USD 5,400.00 — controller rejected the FX rate date

**Bank statement line**

- BL-019 · 2026-08-21 · -$5,400.00
- Counterparty: Meridian Cloud SARL
- Reference: INV-MC-118
- Description: INTL WIRE EUR INVOICE SETTLEMENT

**Candidate ledger entries**

- GL-2302 · 2026-08-21 · account 2100 · period 2026-08 · $5,371.00 · posted — AP - Meridian Cloud EUR 5,000 invoice at invoice-date carrying value

**Supporting evidence available to the agent**

- DOC-MC-118 · vendor_invoice · issued 2026-08-19 · €5,000.00 · ref INV-MC-118 · transactionDate=2026-08-19, terms=NET 2

**FX observations the agent could see**

- FXO-0811-APX · 1.0785 spot · 2026-08-11 · APEX-REF-RATES
- FXO-0814-STF · 1.089 spot · 2026-08-14 · STREETFX-FEED · NOT policy-approved
- FXO-0814-APX · 1.0871 spot · 2026-08-14 · APEX-REF-RATES
- FXO-0819-APX · 1.0742 spot · 2026-08-19 · APEX-REF-RATES
- FXO-0821-APX · 1.08 spot · 2026-08-21 · APEX-REF-RATES
- FXO-0826-APX · 1.08 spot · 2026-08-26 · APEX-REF-RATES
- FXO-0827-APX · 1.06 spot · 2026-08-27 · APEX-REF-RATES
- FXO-0829-APX · 1.08 spot · 2026-08-29 · APEX-REF-RATES
- FXO-0831-APX · 1.08 closing · 2026-08-31 · APEX-REF-RATES
- FXO-0825-APX · 1.08 spot · 2026-08-25 · APEX-REF-RATES
- FXO-0822-APX · 1.0785 spot · 2026-08-22 · APEX-REF-RATES

**What Verity expects**

- Disposition: `fx_revaluation`
- Routing: `review`
- Journal accounts: `2100`, `7420`, `1010`
- Benchmark split: discovery
- Note: v1 baseline failure: approved source, settlement-date rate. Supports CPR-001.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-006: approved | corrected
note:
```

---

## CASE-008

EUR 1,950 invoice settled in USD 2,145.00 — approved transaction-date spot rate used correctly

**Bank statement line**

- BL-024 · 2026-08-28 · -$2,145.00
- Counterparty: Orion Print BV
- Reference: INV-OP-771
- Description: INTL WIRE EUR INVOICE SETTLEMENT

**Candidate ledger entries**

- GL-2361 · 2026-08-28 · account 2100 · period 2026-08 · $2,106.00 · posted — AP - Orion Print EUR 1,950 invoice at invoice-date carrying value

**Supporting evidence available to the agent**

- DOC-OP-771 · vendor_invoice · issued 2026-08-26 · €1,950.00 · ref INV-OP-771 · transactionDate=2026-08-26, terms=NET 2

**FX observations the agent could see**

- FXO-0811-APX · 1.0785 spot · 2026-08-11 · APEX-REF-RATES
- FXO-0814-STF · 1.089 spot · 2026-08-14 · STREETFX-FEED · NOT policy-approved
- FXO-0814-APX · 1.0871 spot · 2026-08-14 · APEX-REF-RATES
- FXO-0819-APX · 1.0742 spot · 2026-08-19 · APEX-REF-RATES
- FXO-0821-APX · 1.08 spot · 2026-08-21 · APEX-REF-RATES
- FXO-0826-APX · 1.08 spot · 2026-08-26 · APEX-REF-RATES
- FXO-0827-APX · 1.06 spot · 2026-08-27 · APEX-REF-RATES
- FXO-0829-APX · 1.08 spot · 2026-08-29 · APEX-REF-RATES
- FXO-0831-APX · 1.08 closing · 2026-08-31 · APEX-REF-RATES
- FXO-0825-APX · 1.08 spot · 2026-08-25 · APEX-REF-RATES
- FXO-0822-APX · 1.0785 spot · 2026-08-22 · APEX-REF-RATES

**What Verity expects**

- Disposition: `fx_revaluation`
- Routing: `review`
- Journal accounts: `2100`, `7420`, `1010`
- Benchmark split: counterexample
- Note: Negative counterexample. VERITY-FX-005 must NOT catch this.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-008: approved | corrected
note:
```

---

## CASE-009

EUR 2,300 invoice settled in USD 2,484.00 — controller rejected the settlement-date FX rate

**Bank statement line**

- BL-026 · 2026-08-29 · -$2,484.00
- Counterparty: Halden Werke
- Reference: INV-HW-903
- Description: INTL WIRE EUR INVOICE SETTLEMENT

**Candidate ledger entries**

- GL-2377 · 2026-08-29 · account 2100 · period 2026-08 · $2,438.00 · posted — AP - Halden Werke EUR 2,300 invoice at invoice-date carrying value

**Supporting evidence available to the agent**

- DOC-HW-903 · vendor_invoice · issued 2026-08-27 · €2,300.00 · ref INV-HW-903 · transactionDate=2026-08-27, terms=NET 2

**FX observations the agent could see**

- FXO-0811-APX · 1.0785 spot · 2026-08-11 · APEX-REF-RATES
- FXO-0814-STF · 1.089 spot · 2026-08-14 · STREETFX-FEED · NOT policy-approved
- FXO-0814-APX · 1.0871 spot · 2026-08-14 · APEX-REF-RATES
- FXO-0819-APX · 1.0742 spot · 2026-08-19 · APEX-REF-RATES
- FXO-0821-APX · 1.08 spot · 2026-08-21 · APEX-REF-RATES
- FXO-0826-APX · 1.08 spot · 2026-08-26 · APEX-REF-RATES
- FXO-0827-APX · 1.06 spot · 2026-08-27 · APEX-REF-RATES
- FXO-0829-APX · 1.08 spot · 2026-08-29 · APEX-REF-RATES
- FXO-0831-APX · 1.08 closing · 2026-08-31 · APEX-REF-RATES
- FXO-0825-APX · 1.08 spot · 2026-08-25 · APEX-REF-RATES
- FXO-0822-APX · 1.0785 spot · 2026-08-22 · APEX-REF-RATES

**What Verity expects**

- Disposition: `fx_revaluation`
- Routing: `review`
- Journal accounts: `2100`, `7420`, `1010`
- Benchmark split: discovery
- Note: v1 baseline failure: approved spot rate dated the settlement day. Supports CPR-001.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-009: approved | corrected
note:
```

---

## CASE-007

Two ledger candidates share reference INV-AMB-77 — ambiguous match escalated

**Bank statement line**

- BL-027 · 2026-08-15 · -$500.00
- Counterparty: Delta Supplies
- Reference: INV-AMB-77
- Description: Duplicate reference candidates

**Candidate ledger entries**

- GL-2401 · 2026-08-15 · account 1010 · period 2026-08 · -$500.00 · posted — Candidate A
- GL-2402 · 2026-08-15 · account 1010 · period 2026-08 · -$500.00 · posted — Candidate B

**Supporting evidence available to the agent:** none.

**What Verity expects**

- Disposition: `escalate`
- Routing: `escalate`
- Journal accounts: none (non-posting)
- Benchmark split: discovery
- Note: Ambiguous match — two ledger candidates share the same reference.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-007: approved | corrected
note:
```

---

## CASE-010

Agent proposed journal for ACME-EU instead of ACME-US — wrong entity blocked

**Bank statement line**

- BL-028 · 2026-08-16 · -$1,200.00
- Counterparty: Coastal Parts
- Reference: INV-CP-441
- Description: Wrong entity proposal test

**Candidate ledger entries**

- GL-2403 · 2026-08-16 · account 2100 · period 2026-08 · $1,200.00 · posted — AP liability

**Supporting evidence available to the agent**

- DOC-CP-441 · invoice · issued 2026-08-10 · $1,200.00 · ref INV-CP-441 · transactionDate=2026-08-10

**What Verity expects**

- Disposition: `bank_fee_journal`
- Routing: `review`
- Journal accounts: `2100`, `1010`
- Benchmark split: discovery
- Note: Wrong entity on journal lines must be blocked by VERITY-AI-003.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-010: approved | corrected
note:
```

---

## CASE-011

Invoice USD 1,000 settled USD 950 — short pay disposition

**Bank statement line**

- BL-029 · 2026-08-17 · -$950.00
- Counterparty: Summit Tools
- Reference: INV-ST-220
- Description: Short pay against invoice

**Candidate ledger entries**

- GL-2404 · 2026-08-17 · account 2100 · period 2026-08 · $1,000.00 · posted — AP liability

**Supporting evidence available to the agent**

- DOC-ST-220 · invoice · issued 2026-08-12 · $1,000.00 · ref INV-ST-220 · transactionDate=2026-08-12

**What Verity expects**

- Disposition: `short_pay`
- Routing: `review`
- Journal accounts: `2100`, `1010`
- Benchmark split: discovery
- Note: Partial settlement against a larger invoice.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-011: approved | corrected
note:
```

---

## CASE-012

EUR 4,100 invoice settled USD 4,428 — held-out settlement-date FX rate case

**Bank statement line**

- BL-030 · 2026-08-25 · -$4,428.00
- Counterparty: Brandt Metall
- Reference: INV-BM-104
- Description: Held-out FX settlement-date rate

**Candidate ledger entries**

- GL-2405 · 2026-08-25 · account 2100 · period 2026-08 · $4,100.00 · posted — AP liability EUR 4100

**Supporting evidence available to the agent**

- DOC-BM-104 · invoice · issued 2026-08-22 · €4,100.00 · ref INV-BM-104 · transactionDate=2026-08-22

**FX observations the agent could see**

- FXO-0811-APX · 1.0785 spot · 2026-08-11 · APEX-REF-RATES
- FXO-0814-STF · 1.089 spot · 2026-08-14 · STREETFX-FEED · NOT policy-approved
- FXO-0814-APX · 1.0871 spot · 2026-08-14 · APEX-REF-RATES
- FXO-0819-APX · 1.0742 spot · 2026-08-19 · APEX-REF-RATES
- FXO-0821-APX · 1.08 spot · 2026-08-21 · APEX-REF-RATES
- FXO-0826-APX · 1.08 spot · 2026-08-26 · APEX-REF-RATES
- FXO-0827-APX · 1.06 spot · 2026-08-27 · APEX-REF-RATES
- FXO-0829-APX · 1.08 spot · 2026-08-29 · APEX-REF-RATES
- FXO-0831-APX · 1.08 closing · 2026-08-31 · APEX-REF-RATES
- FXO-0825-APX · 1.08 spot · 2026-08-25 · APEX-REF-RATES
- FXO-0822-APX · 1.0785 spot · 2026-08-22 · APEX-REF-RATES

**What Verity expects**

- Disposition: `fx_revaluation`
- Routing: `review`
- Journal accounts: `2100`, `7420`, `1010`
- Benchmark split: held_out
- Note: Held-out replay case for the same failure class. Never used to draft CPR-001.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-012: approved | corrected
note:
```

---

## CASE-A01

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-001 · 2026-08-01 · $1,520.00
- Counterparty: Northwind Retail
- Reference: RCPT-1001
- Description: Customer receipt, August batch

**Candidate ledger entries**

- GL-1001 · 2026-08-01 · account 1010 · period 2026-08 · $1,520.00 · posted — Customer receipt

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A01: approved | corrected
note:
```

---

## CASE-A02

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-002 · 2026-08-02 · -$825.40
- Counterparty: Metro Office
- Reference: INV-MO-441
- Description: Office supplies

**Candidate ledger entries**

- GL-1002 · 2026-08-02 · account 1010 · period 2026-08 · -$825.40 · posted — Office supplies

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A02: approved | corrected
note:
```

---

## CASE-A03

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-003 · 2026-08-03 · $2,400.00
- Counterparty: Bluebird Labs
- Reference: RCPT-1003
- Description: Customer receipt

**Candidate ledger entries**

- GL-1003 · 2026-08-03 · account 1010 · period 2026-08 · $2,400.00 · posted — Customer receipt

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A03: approved | corrected
note:
```

---

## CASE-A04

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-004 · 2026-08-04 · -$1,160.00
- Counterparty: Harbor Telecom
- Reference: INV-HT-773
- Description: Telecom payment

**Candidate ledger entries**

- GL-1004 · 2026-08-04 · account 1010 · period 2026-08 · -$1,160.00 · posted — Telecom payment

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A04: approved | corrected
note:
```

---

## CASE-A05

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-005 · 2026-08-05 · $975.25
- Counterparty: Atlas Foods
- Reference: RCPT-1005
- Description: Customer receipt

**Candidate ledger entries**

- GL-1005 · 2026-08-05 · account 1010 · period 2026-08 · $975.25 · posted — Customer receipt

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A05: approved | corrected
note:
```

---

## CASE-A06

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-006 · 2026-08-06 · -$430.10
- Counterparty: City Utilities
- Reference: INV-CU-118
- Description: Utility payment

**Candidate ledger entries**

- GL-1006 · 2026-08-06 · account 1010 · period 2026-08 · -$430.10 · posted — Utility payment

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A06: approved | corrected
note:
```

---

## CASE-A07

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-008 · 2026-08-09 · $3,125.00
- Counterparty: Evergreen Stores
- Reference: RCPT-1008
- Description: Customer receipt

**Candidate ledger entries**

- GL-1008 · 2026-08-09 · account 1010 · period 2026-08 · $3,125.00 · posted — Customer receipt

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A07: approved | corrected
note:
```

---

## CASE-A08

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-010 · 2026-08-12 · -$704.00
- Counterparty: Signal Hosting
- Reference: INV-SH-902
- Description: Hosting payment

**Candidate ledger entries**

- GL-1010 · 2026-08-12 · account 1010 · period 2026-08 · -$704.00 · posted — Hosting payment

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A08: approved | corrected
note:
```

---

## CASE-A09

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-012 · 2026-08-13 · $1,880.75
- Counterparty: Riverstone Co
- Reference: RCPT-1012
- Description: Customer receipt

**Candidate ledger entries**

- GL-1012 · 2026-08-13 · account 1010 · period 2026-08 · $1,880.75 · posted — Customer receipt

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A09: approved | corrected
note:
```

---

## CASE-A10

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-013 · 2026-08-14 · -$560.00
- Counterparty: Paper Trail LLC
- Reference: INV-PT-311
- Description: Printing payment

**Candidate ledger entries**

- GL-1013 · 2026-08-14 · account 1010 · period 2026-08 · -$560.00 · posted — Printing payment

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A10: approved | corrected
note:
```

---

## CASE-A11

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-015 · 2026-08-17 · $4,275.00
- Counterparty: Keystone Market
- Reference: RCPT-1015
- Description: Customer receipt

**Candidate ledger entries**

- GL-1015 · 2026-08-17 · account 1010 · period 2026-08 · $4,275.00 · posted — Customer receipt

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A11: approved | corrected
note:
```

---

## CASE-A12

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-017 · 2026-08-19 · -$990.50
- Counterparty: Vector Security
- Reference: INV-VS-887
- Description: Security payment

**Candidate ledger entries**

- GL-1017 · 2026-08-19 · account 1010 · period 2026-08 · -$990.50 · posted — Security payment

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A12: approved | corrected
note:
```

---

## CASE-A13

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-018 · 2026-08-20 · $1,333.33
- Counterparty: Juniper Works
- Reference: RCPT-1018
- Description: Customer receipt

**Candidate ledger entries**

- GL-1018 · 2026-08-20 · account 1010 · period 2026-08 · $1,333.33 · posted — Customer receipt

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A13: approved | corrected
note:
```

---

## CASE-A14

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-020 · 2026-08-22 · -$2,250.00
- Counterparty: Redwood Leasing
- Reference: INV-RL-552
- Description: Lease payment

**Candidate ledger entries**

- GL-1020 · 2026-08-22 · account 1010 · period 2026-08 · -$2,250.00 · posted — Lease payment

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A14: approved | corrected
note:
```

---

## CASE-A15

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-021 · 2026-08-24 · $680.00
- Counterparty: Sunfield Media
- Reference: RCPT-1021
- Description: Customer receipt

**Candidate ledger entries**

- GL-1021 · 2026-08-24 · account 1010 · period 2026-08 · $680.00 · posted — Customer receipt

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A15: approved | corrected
note:
```

---

## CASE-A16

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-022 · 2026-08-25 · -$1,499.99
- Counterparty: Cloud Nine Ltd
- Reference: INV-CN-730
- Description: Software payment

**Candidate ledger entries**

- GL-1022 · 2026-08-25 · account 1010 · period 2026-08 · -$1,499.99 · posted — Software payment

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A16: approved | corrected
note:
```

---

## CASE-A17

Auto-cleared: Unique currency, signed amount, reference, and date match

**Bank statement line**

- BL-023 · 2026-08-27 · $2,050.00
- Counterparty: Orchard Systems
- Reference: RCPT-1023
- Description: Customer receipt

**Candidate ledger entries**

- GL-1023 · 2026-08-27 · account 1010 · period 2026-08 · $2,050.00 · posted — Customer receipt

**Supporting evidence available to the agent:** none.

**Your verdict** — replace one word, add a note if corrected:

```
CASE-A17: approved | corrected
note:
```

---

## Returning your verdicts

Send back a JSON file shaped like this:

```json
{
  "reviewer": "Name, role, firm",
  "reviewedAt": "2026-09-06",
  "caseReviews": {
    "CASE-001": "approved",
    "CASE-002": "approved",
    "CASE-003": "approved",
    "CASE-004": "approved",
    "CASE-005": "approved",
    "CASE-006": "approved",
    "CASE-008": "approved",
    "CASE-009": "approved",
    "CASE-007": "approved",
    "CASE-010": "approved",
    "CASE-011": "approved",
    "CASE-012": "approved",
    "CASE-A01": "approved",
    "CASE-A02": "approved",
    "CASE-A03": "approved",
    "CASE-A04": "approved",
    "CASE-A05": "approved",
    "CASE-A06": "approved",
    "CASE-A07": "approved",
    "CASE-A08": "approved",
    "CASE-A09": "approved",
    "CASE-A10": "approved",
    "CASE-A11": "approved",
    "CASE-A12": "approved",
    "CASE-A13": "approved",
    "CASE-A14": "approved",
    "CASE-A15": "approved",
    "CASE-A16": "approved",
    "CASE-A17": "approved"
  },
  "corrections": {
    "CASE-001": "What we got wrong, in your words."
  }
}
```

Then: `npm run review:import <that-file.json>`.

One narrow question, if you have time for nothing else:

> When a reconciliation exception reaches a controller, what missing evidence
> or policy violation most often forces it back to the preparer?
