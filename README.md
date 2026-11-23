# Enterprise Billing & Inventory Management System (Frontend)

A production-grade, responsive single-page web application built with **React 18**, **Vite**, **TypeScript (Strict)**, **Material-UI (MUI v5)**, and **Redux Toolkit / RTK Query**.

Designed for small-to-medium manufacturing, wholesale, and service businesses operating under Indian GST regulations.

---

## 🚀 Key Features by Module

- **Authentication & App Shell (`Phase 1`):**
  - Session cookie-based authentication with CSRF protection (`csrftoken` header on all mutation requests).
  - RBAC (Role-Based Access Control) supporting `ADMIN` and `STAFF` roles with route guards (`ProtectedRoute`, `RoleRoute`) and UI element gating (`RoleGate`).
  - Persistent layout with responsive collapsing drawer, active path highlighting, and dynamic company logo branding.
- **Company Profile (`Phase 2`):**
  - Business details management: Business Name, Address, Phone, Email, and 15-character Indian GSTIN.
  - Multipart/form-data logo uploader with live preview and validation.
- **Staff Management (`Phase 3`):**
  - Admin-only staff provisioning: credentials creation, role assignments, activation toggling, and administrative password resets.
- **Customer Directory (`Phase 4`):**
  - Customer profile ledger: auto-generated customer code (`C0001`), GSTIN, billing address, and phone validation.
  - Tabular Customer Detail view: Overview, Open Invoices (with remaining `balance_due`), and Date-Range Filterable Ledger Statement (Debit/Credit running balance).
  - Reusable debounced `CustomerPicker` autocomplete.
- **Products & Inventory (`Phase 5`):**
  - Categorization of `GOODS`, `GOODS_HARDWARE`, and `SERVICE`.
  - Conditional validation enforcing omission of `opening_stock` and `reorder_level` for service items.
  - Stock auditing and management: `Stock-In` (PO fulfillment) and `Stock Adjustment` (signed correction with required audit reason).
  - Complete stock ledger audit trail (`/inventory/movements`) with movement type badges.
- **Invoicing Engine (`Phase 6`):**
  - Stateless live totals calculation (`POST /api/invoices/calculate/`) ensuring server-authoritative GST, CGST, SGST, roundoff, and grand totals.
  - Complete lifecycle management: Draft creation, draft editing, and issuing.
  - Immutable issued invoices: atomic inventory deduction on issuance with `INSUFFICIENT_STOCK` error alerting.
  - Real-time PDF viewing and downloading via binary stream handlers.
  - Physical goods fulfillment tracking via `AwaitingDispatchPanel`.
- **Delivery Challans (`Phase 7`):**
  - Shipment fulfillment and gate pass generation for issued invoices.
  - Capped quantity inputs preventing over-dispatch beyond remaining undispatched invoice balances.
  - PDF document generation and printing.
- **Customer Payments & Multi-Invoice Allocations (`Phase 8`):**
  - Client-side idempotency guarantee via UUID `client_token` initialized per form instance.
  - Chronological "Auto-allocate (oldest first)" algorithm across open customer invoices.
  - Interactive allocation balancing ensuring `sum(allocations) === amount` and capping allocations to each invoice's `balance_due`.
  - Detailed payment receipts with settled invoice breakdowns.
- **Expenses & Other Income (`Phase 9`):**
  - Tracking of operational overheads and miscellaneous non-sales income.
  - Database-aggregated server `total_amount` summary KPI cards across filtered datasets.
  - Date-range filtered Excel (`.xlsx`) workbook export streams.
  - Bookkeeping category management with admin-only creation gates.
- **Executive Dashboard (`Phase 10`):**
  - Real-time business KPI metrics: Today's Sales, Month's Revenue, Collections, Customer Receivables, Monthly Expenses, Other Income, Tracked Stock, and Pending Dispatches.
  - Quick action shortcuts, recent invoices table, and low-stock threshold warning table.
  - Window focus refetching and cross-cache synchronization via RTK Query tags.
- **Hardening & Delivery (`Phase 11`):**
  - Full route-level code splitting using `React.lazy` and `Suspense`.
  - Production build chunk optimization (`vendor-react`, `vendor-mui`, `vendor-redux`).
  - Global `ErrorBoundary`, 403 Forbidden, and 404 Not Found states.
  - Comprehensive unit test coverage across utils, allocation engines, and validation schemas.
  - Automated GitHub Actions CI workflow.

---

## 🛠️ Technology Stack

- **Core:** React 18, Vite 5, TypeScript 5 (Strict Mode)
- **UI & Layout:** Material-UI (MUI v5), Emotion, `@mui/icons-material`, `@mui/x-date-pickers` (Dayjs adapter)
- **State Management & Data Fetching:** Redux Toolkit, RTK Query
- **Form & Validation:** React Hook Form, Zod
- **Arithmetic & Formatting:** `decimal.js` (for strict financial precision), `dayjs`
- **Testing:** Vitest, Testing Library

---

## 📁 Project Architecture

```
src/
├── components/          # Reusable UI components
│   ├── auth/            # AuthBootstrap session loader
│   ├── challans/        # DispatchLinesTable
│   ├── common/          # PageHeader, MoneyText, DateText, StatusChip, RoleGate, FileDownloadButton
│   ├── customers/       # CustomerPicker, CustomerForm, OpenInvoicesTable, StatementTable
│   ├── data-display/    # DataTable, FilterBar, StatCard, KeyValueList
│   ├── expenses/        # ExpenseFormDialog
│   ├── feedback/        # ErrorBoundary, ApiErrorAlert, SnackbarHost, NotFoundState
│   ├── form/            # FormTextField, FormSelect, FormSwitch, FormDatePicker, FormQuantityField
│   ├── income/          # IncomeFormDialog
│   ├── invoices/        # InvoiceLineEditor, InvoiceTotalsPanel, InvoiceActions, AwaitingDispatchPanel, InvoiceForm
│   ├── layout/          # AppShell, Topbar, Sidebar, AuthLayout
│   ├── payments/        # AllocationTable
│   └── products/        # ProductPicker, ProductForm, StockBadge, StockInDialog, AdjustStockDialog
├── constants/           # Enums, route paths, navigation config, validation regex, tags
├── hooks/               # useAuth, useNotify, useDebounce, usePaginationParams
├── pages/               # Route page components (code-split)
├── routes/              # AppRouter, ProtectedRoute, RoleRoute
├── schemas/             # Zod validation schemas and unit tests
├── store/               # Redux store, baseApi (RTK Query), slice reducers
├── theme/               # MUI Theme configuration
├── types/               # TypeScript interfaces & API DTO contracts
└── utils/               # decimal.js money math, allocation algorithms, date/format helpers, downloads
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v20+ recommended)
- npm or pnpm

### 1. Clone & Install
```bash
git clone <repository-url>
cd Inventry_invoice_FE
npm install
```

### 2. Environment Variables
Create a `.env` file based on `.env.example`:
```env
VITE_API_BASE_URL=/api
```
*Note: In development, Vite proxies `/api` and `/media` requests to `http://localhost:8000`. In production, requests are routed to the Django backend via `netlify.toml` redirects.*

### 3. Development Server
```bash
npm run dev
```
The application will be running at `http://localhost:3000`.

### 4. Running Tests & Linters
```bash
# Run unit tests
npm test

# Run ESLint validation
npm run lint

# TypeScript strict type checking
npx tsc --noEmit

# Production build
npm run build
```

---

## 🛡️ Coding Guidelines & Quality Standards

- **Strict TypeScript:** No `any`, no non-null assertions (`!`), no `@ts-ignore`, and no app-level `null`.
- **Financial Precision:** Currency values and physical quantities are treated as strings and calculated exclusively with `decimal.js` wrappers in `src/utils/money.ts`.
- **MUI Theming:** Zero hardcoded colors or magic CSS values; strictly themed with MUI palette tokens and responsive grid breakpoints.
- **Idempotency & Auditing:** Critical financial operations (such as payment recording) attach client-generated UUID tokens (`client_token`) to prevent double-charging on network retries.

---

## 📄 License
Private & Confidential — Mohamed Salmaan © 2026.
