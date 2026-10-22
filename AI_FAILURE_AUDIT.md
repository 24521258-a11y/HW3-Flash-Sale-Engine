
# AI FAILURE AUDIT
## HW3 – High-Concurrency Flash-Sale E-Commerce Engine

**Student:** Dinh Nhat Bao Nhi
**Technology:** React, TypeScript, Vite
**Project:** FlashZone – Flash Sale Simulation

---

## 1. Purpose

This document records errors and limitations identified
during AI-assisted software development.

Each confirmed failure includes its root cause,
correction, verification and supporting evidence.

## 2. Confirmed AI Failure

### Failure 1 – Unused TypeScript Import (TS6133)

**AI-generated issue:**
The AI included `RESERVATION_DURATION_MS` in the
imports of `App.tsx` without using the constant.

**Observed error:**
TS6133: 'RESERVATION_DURATION_MS' is declared
but its value is never read.

**Root cause:**
An unnecessary import was left in the generated code.

**Correction:**
Removed `RESERVATION_DURATION_MS` from the import
statement in `App.tsx`.

**Verification:**
The user confirmed that the project built successfully
after the correction.

**Evidence:**
`HW3_AI_Failure_01.png`

**Status:** Confirmed and corrected.

---

## 3. Issues Requiring Verification

### Potential Failure 2 – Timer Restart State Synchronization

**AI-generated issue:**
An earlier timer implementation restarted its countdown
without resetting the parent application's sale state.

**Potential impact:**
The countdown could restart while reservations remained
disabled after sale expiration.

**Correction:**
A parent-controlled restart mechanism was introduced,
using a new timer component key and an inventory reset.

**Verification needed:**
Allow the sale to expire, press Restart Demo, and verify:
1. The timer restarts.
2. The sale becomes active again.
3. Inventory returns to its initial state.
4. The Reserve Now button is enabled.

**Status:** Code-level issue identified.
End-to-end verification pending.

---

### Potential Failure 3 – Production Build Configuration

**AI-generated issue:**
Two additional HTML test pages were introduced without
configuring Vite to include them as separate production
entry points.

**Potential impact:**
The test pages may not appear in the production output.

**Verification needed:**
1. Run `npm run build`.
2. Check whether `dist/stress-test.html` exists.
3. Check whether `dist/unit-tests.html` exists.
4. Open both pages through the production preview.

**Status:** Verification pending.

---

## 4. Final Verification Checklist

- [x] React + TypeScript project created
- [x] Flash Sale interface implemented
- [x] Inventory state machine implemented
- [x] Anti-drift countdown implemented
- [x] TS6133 error corrected
- [ ] Timer restart verified after sale expiration
- [ ] Production test pages verified
- [ ] At least three AI failures fully documented
- [ ] Final production build verified
- [ ] Git history contains at least eight meaningful commits

---

## 5. Conclusion

AI-assisted development accelerated implementation,
but generated code still required manual review,
compilation checks, and behavioral testing.

All unresolved issues must be verified before they
are presented as confirmed failures.
