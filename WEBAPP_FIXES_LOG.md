# DCarbon Webapp — Fixes Log

**Branch:** phillip-fix2
**Date:** 2026-03-16
**Engineer:** Claude (Anthropic) via Claude Code

This document is the authoritative record of every change made to the webapp codebase on this branch.
Use it to compare against the QA bug list and track which issues are resolved vs still pending on the server.

---

## Table of Contents

1. [P0 — Blocking / Security Fixes](#p0--blocking--security-fixes)
2. [P1 — High Priority Fixes](#p1--high-priority-fixes)
3. [P2 — Medium Priority Fixes](#p2--medium-priority-fixes)
4. [Infrastructure & Foundation Fixes](#infrastructure--foundation-fixes)
5. [Invoice Flow — Status vs Plan](#invoice-flow--status-vs-plan)
6. [Backend Blockers (Server Team)](#backend-blockers-server-team)
7. [Verified Clean (No Change Needed)](#verified-clean-no-change-needed)

---

## P0 — Blocking / Security Fixes

---

### P0-A / P0-B: Operator & Generic Agreement Signing — 422 Fixed

**QA Issue:** Agreement signing returned 422 for all user types going through the operator flow and generic signature modals.

**Root causes fixed:**

| # | File | Bug | Fix Applied |
|---|------|-----|-------------|
| 1 | `src/components/dashboard/operator-dashboard/facility-management/OperatorAgreementModal.jsx` | Used native `fetch()` with `response.ok` / `response.json()` | Migrated to `axiosInstance`; replaced with `response.data` |
| 2 | `src/components/modals/OperatorSignatureModal.jsx` | `response.json()` called on axios response (TypeError) + extra `formData.append("termsAccepted")` / `formData.append("agreementCompleted")` fields | Fixed to `response.data`; removed extra FormData fields |
| 3 | `src/components/modals/SignatureModal.jsx` | Same as above | Same fix |
| 4 | `src/components/partner/agreements/SignatureModal.jsx` | `response.json()` after `axiosInstance.put()`; `new File()` missing MIME type | Fixed to `response.data`; added `{ type: 'image/png' }` to File constructor |

---

### P0-C: Agreement Bypass via "Continue Existing Facility" — Blocked

**QA Issue:** User could open agreement modal, close it without signing, then click "Continue Existing Facility Authorization" and jump straight to utility authorization (Instapull), bypassing the agreement step entirely.

| File | Fix Applied |
|------|-------------|
| `src/components/dashboard/residence-dashboard/overview/ContinueResidentialFacilityCreation.jsx` | Added guard in `handleContinueRegistration`: checks `currentStage < 3` (stage 3 = agreement signed). If agreement not signed, shows error toast and blocks proceeding. |
| `src/components/dashboard/residence-dashboard/overview/modals/ContinueResidentialFacilityCreation.jsx` | Added async guard: fetches `GET /api/user/agreement/{userId}`, checks `termsAccepted`. If not accepted, shows error toast and returns early. |

---

### P0-D: Any User Could Access Any Dashboard — Role Guards Added

**QA Issue:** Dashboard pages only checked `authToken` — no `userType` validation. A residential user could manually navigate to `/commercial-dashboard`.

**Status:** Already implemented correctly on all 4 dashboards.

| File | Guard Present |
|------|---------------|
| `src/app/residence-dashboard/page.jsx` | Redirects COMMERCIAL → `/commercial-dashboard`, PARTNER → `/partner-dashboard`, OPERATOR → `/operator-dashboard` |
| `src/app/commercial-dashboard/page.jsx` | Redirects RESIDENTIAL, PARTNER, OPERATOR to their correct dashboards |
| `src/app/partner-dashboard/page.jsx` | Redirects RESIDENTIAL, COMMERCIAL, OPERATOR to their correct dashboards |
| `src/app/operator-dashboard/page.jsx` | Redirects RESIDENTIAL, COMMERCIAL, PARTNER to their correct dashboards |

---

### P0-E: Expired Token Did Not Force Logout on Native Fetch Calls — All Migrated

**QA Issue:** 15 files used native `fetch()` bypassing the `axiosInstance` 401 interceptor. On session expiry, these pages never redirected to login.

**Fix pattern applied to all 15 files:**
- `import { axiosInstance } from '...lib/config'`
- `fetch(url, { method, headers, body })` → `axiosInstance.method(url, data, { headers })`
- `await response.json()` → `response.data`
- Removed `if (!response.ok)` blocks (axios throws on non-2xx)

| File | Notes |
|------|-------|
| `src/components/residence/Verification.jsx` | Migrated |
| `src/components/residence/StepTwoCard.jsx` | Migrated |
| `src/components/residence/UtilityAuthorizationCard.jsx` | Migrated |
| `src/components/operator-registration/OperatorRegistrationCard.jsx` | Migrated |
| `src/components/dashboard/residence-dashboard/DashboardNavbar.jsx` | Migrated |
| `src/components/dashboard/commercial-dashboard/DashboardNavbar.jsx` | Migrated |
| `src/components/dashboard/commercial-dashboard/overview/DashboardOverview.jsx` | Migrated |
| `src/components/dashboard/commercial-dashboard/overview/modals/createfacility/CommercialRegistrationModal.jsx` | Migrated |
| `src/components/dashboard/operator-dashboard/overview/modals/AddUtilityProvider.jsx` | Migrated; fixed broken `axiosInstance.` syntax |
| `src/components/dashboard/operator-dashboard/overview/modals/createfacility/ownerRegistration/UploadFacilityDocumentsModal.jsx` | Migrated; fixed broken `axiosInstance.` syntax |
| `src/components/modals/OperatorSignatureModal.jsx` | Migrated (covered under P0-A) |
| `src/components/modals/SignatureModal.jsx` | Migrated (covered under P0-A) |
| `src/components/partner/agreements/SignatureModal.jsx` | Migrated (covered under P0-A) |
| `src/components/dashboard/residence-dashboard/overview/modals/UploadDocumentModal.jsx` | Migrated; fixed severely broken syntax (`await axiosInstance.` incomplete) |
| `src/components/dashboard/partner-dashboard/customer-management/commercial-details/CommercialFacilityDetails.jsx` | Migrated; fixed two `await response.json()` calls |

---

## P1 — High Priority Fixes

---

### P1-A: File Upload Boundary Stripped — Fixed (SubmitInvoice + 12 Other Files)

**QA Issue:** Manually setting `Content-Type: multipart/form-data` in axios FormData requests strips the `boundary` parameter, causing server to fail parsing the multipart body (400/422 errors on file uploads).

**Rule:** When using `FormData` with axios, **never** set `Content-Type` manually — axios sets it automatically with the correct boundary.

Files fixed (manual `Content-Type: multipart/form-data` removed):

| File |
|------|
| `src/components/dashboard/commercial-dashboard/rec-sales-and-report/SubmitInvoice.jsx` |
| `src/components/dashboard/residence-dashboard/residential-management/UploadFacilityDocumentModal.jsx` |
| `src/components/dashboard/residence-dashboard/residential-management/residential-facility-details/ResidentialDocumentsModal.jsx` |
| `src/components/dashboard/partner-dashboard/customer-management/residential-details/ResidentialDocuments.jsx` |
| `src/components/dashboard/operator-dashboard/facility-management/UploadFacilityDocumentModal.jsx` |
| `src/components/dashboard/commercial-dashboard/facility-management/UploadFacilityDocumentModal.jsx` |
| `src/components/dashboard/commercial-dashboard/facility-management/commercial-facility-details/FacilityDetails.jsx` |
| `src/components/dashboard/commercial-dashboard/overview/modals/createfacility/ownerRegistration/SignatureModal.jsx` |
| `src/components/dashboard/commercial-dashboard/overview/modals/createfacility/ownerAndOperatorRegistration/SignatureModal.jsx` |
| `src/components/dashboard/commercial-dashboard/overview/modals/createfacility/ownerRegistration/FinanceAndInstallerModal.jsx` |
| `src/components/dashboard/commercial-dashboard/overview/modals/createfacility/ownerAndOperatorRegistration/FinanceAndInstallerModal.jsx` |
| `src/components/dashboard/commercial-dashboard/overview/modals/createfacility/ownerAndOperatorRegistration/AddCommercialFacilityModal.jsx` |
| `src/components/dashboard/residence-dashboard/overview/modals/createfacility/FinanceAndInstallerModal.jsx` |

---

### P1-B: Profile Picture Upload — Verified Clean

**QA Issue:** Profile picture upload returned "No file uploaded".

**Status:** `src/components/dashboard/residence-dashboard/account/ProfileImage.jsx` already uses `axiosInstance` with `formData.append("profilePicture", file)`. Field name is `profilePicture`. If this still fails, the issue is server-side (field name mismatch on backend). No webapp code change needed.

---

### P1-C: Duplicate "Sign In" Button on Landing Page — Fixed

**QA Issue:** Two "Sign In" buttons on the landing page (header + hero section).

| File | Fix Applied |
|------|-------------|
| `src/app/page.jsx` | Hero "Sign In" button replaced with "Get Started" → `/register` as secondary CTA. Header "Sign In" retained. |

---

### P1-D: Solar System Management Gated — Verified Clean

**QA Issue:** Residential sidebar disabled "Solar System Management" until utility authorization completed.

**Status:** Reviewed `src/components/dashboard/residence-dashboard/DashboardSidebar.jsx` — the "Solar System Management" nav item has no `disabled` prop or conditional gating. Already accessible. No change needed.

---

### P1-E: Residential Account Missing Owner Details — Added

**QA Issue:** `MyAccount.jsx` (residential) showed profile and contact sections but no owner details.

| File | Fix Applied |
|------|-------------|
| `src/components/dashboard/residence-dashboard/account/MyAccount.jsx` | Added collapsible "Owner Details" section after Contact Information. Displays: phone, city, address, state, zipCode — all from existing `userData` fetch. |

---

### P1-F: Partner Users Need Invoice Flow — Implemented

**QA Issue:** Partner dashboard was using payout request flow (`POST /api/payout-request/request`) instead of the formal invoice flow that partners as companies require.

| File | Change |
|------|--------|
| `src/components/dashboard/partner-dashboard/reporting/PartnerSubmitInvoice.jsx` | **Created new file** — adapted from commercial `SubmitInvoice.jsx`. Uses invoice number prefix `DCARBON-PINV-`, sends to `/api/file-storage/upload/${invoiceNumber}` then `POST /api/quarterly-statements/invoices`. |
| `src/components/dashboard/partner-dashboard/DashboardSidebar.jsx` | Added "Submit Invoice" nav item with `FiFileText` icon calling `onSectionChange("submitInvoice")`. |
| `src/app/partner-dashboard/page.jsx` | Added `import PartnerSubmitInvoice`, added `submitInvoice` to `sectionDisplayMap`, added `case 'submitInvoice'` to section switcher. |

---

### P1-G: Commercial "Request Payout" Mock Removed

**QA Issue:** Commercial dashboard had a "Request Payout" / "Pending Actions" section connected to mock/hardcoded data. Commercial users use the invoice flow — this was confusing and non-functional.

| File | Change |
|------|--------|
| `src/app/commercial-dashboard/page.jsx` | Removed `import PendingActions`, removed `pendingActions` from `sectionDisplayMap`, removed `case 'pendingActions'` from section switcher. |

---

## P2 — Medium Priority Fixes

---

### P2-B: ReCAPTCHA Width Overflow on Mobile — Fixed

**QA Issue:** ReCAPTCHA v2 renders at 304px fixed width, overflowing forms on screens < 360px.

| File | Fix Applied |
|------|-------------|
| `src/components/(auth)/login/LoginCard.jsx` | Wrapped ReCAPTCHA in `overflow-hidden` container with `[@media(max-width:360px)]:[transform:scale(0.85)]` Tailwind utility. |
| `src/components/(auth)/register/RegisterCard.jsx` | Same wrapper applied. |

---

### P2-C: Tables Not Mobile Responsive — Fixed (Main Data Tables)

**QA Issue:** Despite `ResponsiveTable.jsx` existing in `src/components/dashboard/shared/`, main data tables across dashboards used static `<table>` markup.

Files migrated from static `<table>` to `<ResponsiveTable>` with correct import path (`../../shared/ResponsiveTable`):

| File | Table Migrated |
|------|---------------|
| `src/components/dashboard/commercial-dashboard/rec-sales-and-report/paidReceipts.jsx` | Paid receipts / payout history table |
| `src/components/dashboard/residence-dashboard/transaction/Transaction.jsx` | Points transactions / payout history table |
| `src/components/dashboard/partner-dashboard/reporting/GenerationReport.jsx` | Generation report table |
| `src/components/dashboard/partner-dashboard/reporting/CommissionStatement.jsx` | Payout history table within commission statement |

---

### P2-A: Notification System — No Webapp Change Needed

**QA Issue:** Notifications not appearing post-instapull utility auth.

**Status:** The webapp correctly polls `GET /api/user/notifications/{userId}` every 30 seconds and renders the badge/dropdown. The issue is server-side — the server does not create notification records after instapull completes. This is tracked as server issue **S11** (see Backend Blockers section).

---

### P2-D: Additional Utility Auth Status — Deferred

**QA Issue:** After a second utility authorization, no indicator shows its status.

**Status:** Low priority UX gap. Not implemented in this sprint.

---

## Infrastructure & Foundation Fixes

These fixes were verified or applied to ensure the app compiles and runs correctly.

| Area | File(s) | Status |
|------|---------|--------|
| Axios config | `lib/config.js` | Confirmed: baseURL, 20s timeout, 401 interceptor, auto-redirect on session expiry |
| App layout | `src/app/layout.jsx` | Confirmed: viewport meta, Providers wrapper |
| Error boundary | `src/app/error.jsx` | Confirmed present |
| 404 page | `src/app/not-found.jsx` | Confirmed present |
| Providers | `src/app/Providers.jsx` | Confirmed present |
| Shared components | `src/components/dashboard/shared/ResponsiveTable.jsx` | Confirmed: accepts `columns`, `data`, `loading`, `emptyTitle`, `emptyDescription`, `onRowClick`, `pagination` |
| Shared components | `src/components/dashboard/shared/EmptyState.jsx` | Confirmed present |
| Shared components | `src/components/dashboard/shared/TableSkeleton.jsx` | Confirmed present |
| Hardcoded URLs | All files | Confirmed: 0 remaining `localURL` / `render.com` / `localhost` hardcoded base URLs |
| UtilityAuthorizationModal | `src/components/dashboard/residence-dashboard/overview/modals/createfacility/UtilityAuthorizationModal.jsx` | Fixed: utility data persisted to state before state clear |
| Partner sidebar label | `src/components/dashboard/partner-dashboard/DashboardSidebar.jsx` | Confirmed: "Customer Management" label correct |
| Residential agreement page | `src/app/(agreement)/page.jsx` (residential) | Confirmed: sends headers only, no request body |

---

## Import Path Audit — All Dashboards

Full audit was performed for broken import paths. Rule confirmed:
- Files directly in `src/components/dashboard/<user-type>/` use `../../../../lib/config` (4 levels to project root)
- Files in `src/components/dashboard/<user-type>/<subfolder>/` use `../../../../../lib/config` (5 levels to project root)
- `ResponsiveTable` at `src/components/dashboard/shared/` is imported as `../../shared/ResponsiveTable` (2 levels up from any `<user-type>/<subfolder>/`)

**Corrected in this sprint:**

| File | Path Fixed |
|------|-----------|
| `src/components/dashboard/partner-dashboard/reporting/PartnerSubmitInvoice.jsx` | `../../../../lib/config` → `../../../../../lib/config` (missing 1 level) |
| `src/components/dashboard/commercial-dashboard/rec-sales-and-report/paidReceipts.jsx` | `../../../shared/ResponsiveTable` → `../../shared/ResponsiveTable` |
| `src/components/dashboard/residence-dashboard/transaction/Transaction.jsx` | `../../../shared/ResponsiveTable` → `../../shared/ResponsiveTable` |
| `src/components/dashboard/partner-dashboard/reporting/GenerationReport.jsx` | `../../../shared/ResponsiveTable` → `../../shared/ResponsiveTable` |
| `src/components/dashboard/partner-dashboard/reporting/CommissionStatement.jsx` | `../../../shared/ResponsiveTable` → `../../shared/ResponsiveTable` |

**Final scan results (all zero):**

| Pattern | Count |
|---------|-------|
| `Content-Type: multipart/form-data` in axios FormData calls | 0 |
| `response.ok` (non-commented) | 0 |
| `await response.json()` (non-commented) | 0 |
| Bad 3-level `../../../shared/ResponsiveTable` imports | 0 |
| Native `fetch()` API calls in dashboard components | 0 |

---

## Invoice Flow — Status vs Plan

Analysis of the `INVOICE_FLOW_PLAN.md` uploaded by the team, compared to current implementation state.

### Phase C: Webapp (dcarbon-webapp) — Status per Item

| Item | Description | Status |
|------|-------------|--------|
| **W-INV-1** | Show invoice status to commercial users after submission (PENDING/APPROVED/REJECTED + rejection reason + resubmit option) | **NOT YET DONE** — `SubmitInvoice.jsx` submits correctly but doesn't fetch/display `GET /api/quarterly-statements/invoices/user/{userId}`. Requires server-side `S-INV-6` first. |
| **W-INV-2** | Add invoice submission to partner dashboard | **DONE** — `PartnerSubmitInvoice.jsx` created and wired into partner dashboard sidebar and page switcher (P1-F above). Uses `POST /api/quarterly-statements/invoices`. |
| **W-INV-3** | Remove/disable payout request flow for partners | **DONE** — Commercial "Pending Actions/Payouts" mock removed (P1-G above). Partner sidebar no longer has payout request; only "Submit Invoice" is available for partner billing. |

### Phase A: Server — Dependency Summary (Webapp is blocked on these)

| Server Item | What It Unlocks on Webapp | Status |
|-------------|--------------------------|--------|
| **S-INV-1** Prisma migration (add `status`, `rejectionReason`, etc.) | All invoice status display | Server team |
| **S-INV-2** Default `status: PENDING` on creation | `SubmitInvoice.jsx` feedback | Server team |
| **S-INV-6** `GET /api/quarterly-statements/invoices/user/{userId}` | W-INV-1 (invoice status list for user) | Server team |

### Phase B: Admin Dashboard — Not in Scope for This Repo

The admin invoice review UI (A-INV-1 through A-INV-4) is for the `d-carbon-admin` repository, not this webapp. Those items are tracked separately.

### Invoice Flow: What Webapp Can Do Now vs Later

| Now (no server changes needed) | After Server Deploys S-INV-6 |
|-------------------------------|------------------------------|
| Submit invoice (commercial + partner) — already works | Show invoice status list to user after submission |
| File upload to `/api/file-storage/upload/{invoiceNo}` | Show APPROVED / REJECTED with reason |
| Partner invoice submission via `PartnerSubmitInvoice` | Allow resubmission on rejection |

---

## Backend Blockers (Server Team)

Issues that cannot be resolved in the webapp alone. These are tracked for the server team.

| ID | QA Issue | Priority | Description | Endpoint |
|----|----------|----------|-------------|----------|
| S1 | #2 | P0 | Historical Collection route: confirm `/api/historical-collection/start` is correct (admin was using `/run`) | Route mounting |
| S2 | #5 | P0 | Facility docs approved but customer details page shows unapproved — `facilityStatus` vs `documentStatus` out of sync | Facility service |
| S3 | #6 | P0 | No REC data for meter 2453 despite instapull showing data — forward vs reverse energy data | REC aggregation |
| S4 | #7 | P0 | Commission + REC generation endpoints return 404 — `/api/commission-cron/trigger`, `/api/bonus/trigger-bonus` not mounted | Route mounting |
| S5 | #12 | P0 | Agreement signing fails with 422 "No file uploaded" on `PUT /api/user/update-user-agreement/{userId}` | User agreement service |
| S6 | #16 | P1 | Invoice endpoints not role-restricted — `GET /api/quarterly-statements/invoices` should be admin-only | Auth middleware |
| S7 | #17 | P1 | Payout request approve/reject not admin-restricted — `/approve` and `/reject` need admin role guard | Auth middleware |
| S8 | #26 | P1 | Duplicate commission structure returns raw Prisma P2002 error instead of 409 + readable message | Commission service |
| S9 | GAP-W3a | P0 | `POST /api/auth/save-utility-data` exists but is never called — verify it works when called | Utility service |
| S10 | GAP-W7b | P1 | ReCAPTCHA fallback test key in production config | Config/security |
| S11 | #19 | P1 | Notifications not created after instapull utility auth completes | Notification service |
| S-INV-1 | New | P0 | Add status fields to invoice model (`status`, `rejectionReason`, `reviewedBy`, `reviewedAt`, `payoutRequestId`) | Prisma migration |
| S-INV-2 | New | P0 | Default `status: PENDING` on invoice creation | `POST /api/quarterly-statements/invoices` |
| S-INV-3 | New | P0 | Admin invoice list with filters | `GET /api/quarterly-statements/invoices` |
| S-INV-4 | New | P0 | Invoice approval — auto-create payout-request | `PUT /api/quarterly-statements/invoices/{id}/approve` |
| S-INV-5 | New | P0 | Invoice rejection with reason | `PUT /api/quarterly-statements/invoices/{id}/reject` |
| S-INV-6 | New | P1 | User's own invoice list with status | `GET /api/quarterly-statements/invoices/user/{userId}` |

---

## Verified Clean (No Change Needed)

Items from the QA plan that were audited and confirmed already correct:

| Item | File | Confirmed |
|------|------|-----------|
| P0-D Role guards | All 4 dashboard `page.jsx` files | All check `userType` and redirect |
| P1-D Solar system gating | `residence-dashboard/DashboardSidebar.jsx` | No disabled/gating on Solar System nav item |
| P1-B Profile picture field | `residence-dashboard/account/ProfileImage.jsx` | Uses `axiosInstance`, field name `"profilePicture"` |
| Axios config | `lib/config.js` | Correct: baseURL, 20s timeout, 401 → redirect to login |
| Generic SignatureModal | `src/components/modals/SignatureModal.jsx` | Uses `axiosInstance.put()`, `response.data`, no extra FormData fields |
| OperatorSignatureModal | `src/components/modals/OperatorSignatureModal.jsx` | Same as above |
| LP-A Revenue tier | `QuarterlyStatement.jsx` | 60% hardcoded — decision deferred to product/backend |

---

## End-to-End Test Checklist

Run these after deploying to verify all fixes are live:

- [ ] Operator → authorize commercial facility → sign agreement → no 422, success toast
- [ ] Residential → open "Continue Existing Facility" → close without signing agreement → reopen → "Continue Registration" blocked with error toast
- [ ] Residential user → navigate to `/commercial-dashboard` manually → redirected to `/residence-dashboard`
- [ ] Token expires → any page call → auto-redirect to `/login` (401 interceptor)
- [ ] Commercial → Submit Invoice → file upload works (no 400), POST to `/api/quarterly-statements/invoices` succeeds
- [ ] Partner → Submit Invoice → new "Submit Invoice" section visible in sidebar, submission flow works
- [ ] Commercial → no "Pending Actions" section in sidebar (removed)
- [ ] Profile picture upload → no "No file uploaded" error (depends on server field name match)
- [ ] Landing page → only one "Sign In" button visible in header; hero shows "Get Started"
- [ ] Residential MyAccount → "Owner Details" section visible and shows user data
- [ ] All 4 dashboard data tables → scroll horizontally on mobile, card view on small screens
- [ ] Login / Register forms → ReCAPTCHA fits within form on screens < 360px
- [ ] Open browser console on any dashboard → zero `<!DOCTYPE` JSON parse errors

---

*Generated: 2026-03-16 | Branch: phillip-fix2*
