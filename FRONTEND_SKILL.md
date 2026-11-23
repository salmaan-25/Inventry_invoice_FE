---
name: billing-inventory-frontend
description: Coding rules and workflow for building the Billing & Inventory Management System frontend (React + Vite + TypeScript + MUI + Redux Toolkit/RTK Query). Use this skill whenever creating, editing, reviewing, or refactoring ANY frontend code in this repo, including pages, components, forms, hooks, utils, constants, types, RTK Query endpoints, Redux slices, routes, or theme. Also use it when the user mentions a screen, page, form, table, API integration, or phase from FRONTEND_PLAN.md, even if they do not explicitly ask for "best practices".
---

# Billing & Inventory Frontend: Development Skill

Follow this skill for **every** change in the frontend repo. Companion documents:

- `FRONTEND_PLAN.md`: pages, routes, phases, architecture (what to build, in what order)
- `API_CONTRACT.md`: backend endpoints and shapes (the only source of API truth)

If a rule here conflicts with a convenience, **the rule wins**. If something is undefined in the contract, **ask; never invent**.

---

## 0. Workflow (always)

1. Identify the phase/feature from `FRONTEND_PLAN.md`. State it and list the files you'll touch.
2. **Search for reuse first**: `components/common`, `components/form`, `components/data-display`, `hooks/`, `utils/`, `constants/`, `types/`. Extend before creating.
3. Build in this order: `types` → `constants` → `utils` → `schemas` → `store/api` → `components` → `pages` → `routes/navigation`.
4. Self-review with the checklist in §14 before finishing. Report deviations or open questions.

---

## 1. Folder responsibilities

| Folder | Contains | Must NOT contain |
|---|---|---|
| `src/pages/` | Thin route-level screens: read route params, call RTK hooks, compose components | Reusable UI, formatting logic, big JSX blobs, API paths |
| `src/components/common/` | Generic reusable UI (PageHeader, ConfirmDialog, StatusChip, MoneyText…) | Feature/domain logic |
| `src/components/form/` | RHF-bound MUI inputs | API calls |
| `src/components/data-display/` | DataTable, FilterBar, StatCard | Domain-specific columns |
| `src/components/<feature>/` | Feature components (InvoiceForm, ProductPicker…) | Route definitions |
| `src/hooks/` | Reusable hooks (`useDebounce`, `usePaginationParams`, `useFileDownload`…) | JSX |
| `src/utils/` | **Pure** helper functions (format, money, date, apiError, query…) | React, Redux, side effects (except `download.ts`/`csrf.ts` DOM helpers) |
| `src/constants/` | Routes, enums + labels, messages, error codes, pagination, validation rules, config | Logic |
| `src/schemas/` | zod schemas per form | Components |
| `src/types/` | DTOs, request/response, enum union types | Runtime logic |
| `src/store/api/` | RTK Query endpoints (one file per domain, injected into `baseApi`) | UI |
| `src/store/slice/` | Redux slices for **client** state only | Server data (that's RTK Query's job) |
| `src/routes/` | Router, guards | Page UI |
| `src/theme.ts` | MUI theme | Component logic |

---

## 2. TypeScript: strict, always

- `strict: true`, `noUncheckedIndexedAccess: true`. Never weaken `tsconfig` to make code compile.
- **No `any`**: not in params, returns, generics, `catch`, or tests. Use proper types, generics, `unknown` + type guards, or `Record<string, unknown>` where truly dynamic.
- **No `null` in app code.** Use `undefined` and optional props (`foo?: string`). Form text fields use `''`.
  - *Only exception:* a DTO field the contract literally returns as JSON `null` (`next`, `previous`, `StockMovement.invoice`). Type it `T | null` **only inside `src/types/api/*`**, and convert/handle it at the boundary. Never pass `null` through props, state, form values, or utils.
- **No non-null assertion (`!`)**, **no `@ts-ignore` / `@ts-expect-error`**, and no `as` casts to silence errors. Narrow with guards instead. (`as const` is fine.)
- Annotate exported function return types. Prefer `interface` for object shapes, `type` for unions.
- Enums: `as const` object + derived union type (never TS `enum`).
  ```ts
  export const ROLE = { ADMIN: 'ADMIN', STAFF: 'STAFF' } as const;
  export type Role = (typeof ROLE)[keyof typeof ROLE];
  ```
- Component props are always an explicit `interface XxxProps`. Use `ReactNode`, `ComponentProps<...>`, and MUI types (`SxProps<Theme>`) rather than loose types.
- Catch blocks: `catch (error: unknown)` → `parseApiError(error)`.
- Type domain primitives: `MoneyString`, `QuantityString`, `IsoDate`, `IsoDateTime` aliases in `types/api/common.ts`.

---

## 3. Reuse & composition

- **Pages compose; components implement.** A page should read like a table of contents.
- If the same JSX/logic appears (or will clearly appear) a second time, extract it **now** into the proper shared folder.
- Never copy-paste a table, dialog, filter bar, or form field. Use `DataTable`, `FormDialog`, `FilterBar`, `Form*` fields.
- Use shared pickers (`CustomerPicker`, `ProductPicker`) wherever a customer/product is chosen.
- Before creating a new shared component, check `FRONTEND_PLAN.md §7`; after creating one, add it to that catalogue.
- Components should be small and single-purpose (rule of thumb: > ~150 lines → split). Keep props minimal and typed; prefer composition (`children`, slot props) over boolean-prop explosions.

---

## 4. UI: MUI design system only

- Use `@mui/material` components + `@mui/icons-material` icons + `@mui/x-date-pickers`. **No other UI/CSS framework**, no custom-styled raw HTML where an MUI component exists.
- Style via the `sx` prop or `styled()` using **theme tokens**: `theme.palette.*`, `theme.spacing()`, `theme.typography.*`, `theme.breakpoints`.
  - ❌ `sx={{ color: '#d32f2f', padding: '13px' }}`
  - ✅ `sx={{ color: 'error.main', p: 2 }}`
- Global component defaults (e.g. `size="small"`, `variant="outlined"`) belong in `theme.ts` `components`, not repeated per usage.
- Layout with `Stack`, `Grid`, `Box`, `Container`; responsive with breakpoint props (`xs`, `sm`, `md`, `lg`).
- Every list/table/form must handle: **loading** (Skeleton/CircularProgress), **empty** (`EmptyState`), **error** (`ApiErrorAlert`), and **data**.
- Feedback via the shared snackbar (`useNotify`), never `alert()`/`window.confirm()` (use `ConfirmDialog`).
- Accessibility: every input has a label, icon-only buttons have `aria-label`, dialogs trap focus (MUI default; don't break it).

---

## 5. State & API: RTK Query + Redux slices

### API (server state) → RTK Query
- All HTTP goes through `baseApi.injectEndpoints` in `src/store/api/<domain>Api.ts`. **No axios, no `fetch`, no `useEffect`-based fetching in components.**
- Use generated hooks (`useGetCustomersQuery`, `useCreateProductMutation`, …). Use `useLazy…Query` for on-demand calls (PDF, export, debounced calculate).
- Queries use `providesTags`; mutations use `invalidatesTags` per the matrix in `FRONTEND_PLAN.md §4.2`. Tag names come from a constant.
- Endpoints are fully typed: `builder.query<ResponseType, ArgType>`. Request args for list endpoints are typed param interfaces (`ListParams`), serialized via `utils/query.buildQueryParams` (drops empty values).
- Base query rules: `credentials: 'include'`; attach `X-CSRFToken` on non-safe methods; do not force `Content-Type` (FormData uploads); central 401 handling.
- Blob endpoints use `responseHandler: (r) => r.blob()` and are consumed via `useFileDownload`.
- Use `transformResponse` only to normalize contract quirks (e.g. null → undefined) at the boundary.
- Call mutations with `.unwrap()` inside `try/catch (error: unknown)`; parse with `parseApiError`.

### Client state → Redux slices
- Slices only for **client-owned** state: `authSlice` (current user/status), `uiSlice` (snackbar, sidebar). **Never copy server lists into slices**, because RTK Query is the cache.
- Typed `useAppDispatch` / `useAppSelector` from `store/hooks.ts`; never raw `useDispatch`/`useSelector`.
- Selectors are exported from the slice file; slice state types are explicit interfaces.
- No `localStorage` / `sessionStorage` for auth or tokens (session cookies only).

---

## 6. No unwanted hardcoding

Move to `src/constants/` (or `.env` via `constants/config.ts`):

| Thing | Where |
|---|---|
| Route paths and builders | `constants/routes.ts` (use `ROUTES.invoices.detail(id)`) |
| Sidebar items + allowed roles | `constants/navigation.ts` |
| Enum values + display labels + chip colors | `constants/enums.ts` |
| API error codes | `constants/apiErrorCodes.ts` |
| User-facing strings (toasts, confirms, fallbacks) | `constants/messages.ts` |
| Page size default/options, debounce ms | `constants/pagination.ts` |
| Regexes, length limits, max file size | `constants/validation.ts` |
| Base URL / env values | `.env` → `constants/config.ts` |
| RTK Query tag names | `constants/` (typed tuple) |

Never inline: `'/customers'`, `'ISSUED'`, `25`, `300` (debounce), `'INSUFFICIENT_STOCK'`, `"Saved successfully"`, `'http://localhost:8000'`. Form-field *labels* local to a single form may live in that form component, but anything shared or repeated goes to constants.

---

## 7. Utilities & helpers

- Any reusable or non-trivial pure logic goes in `src/utils/` (never inside a component body). Hooks that wrap stateful logic go in `src/hooks/`.
- One concern per file; named exports; JSDoc one-liner for non-obvious behaviour; **unit-tested** (Vitest).
- Existing utilities (use, don't re-implement): `money.ts`, `format.ts`, `date.ts`, `apiError.ts`, `download.ts`, `query.ts`, `csrf.ts`, `id.ts`, `validators.ts`. Check them before writing a helper.
- Utils are pure (no React/Redux). Only `download.ts` and `csrf.ts` may touch the DOM.

---

## 8. Money, quantity, dates (domain rules)

- Money = 2-dp **string**, quantity = 3-dp **string** (`"1250.00"`, `"10.500"`). Keep them as strings in state, forms, and DTOs.
- **Never** `parseFloat`/`Number` money or quantity for arithmetic. Use `utils/money.ts` (Decimal-backed: `addMoney`, `sumMoney`, `compareMoney`, `isZeroMoney`…).
- Display only through `formatCurrency` / `formatQuantity` (or `<MoneyText>`), never manual `toFixed`/template strings.
- **Do not compute GST/totals client-side.** Invoice previews use `POST /invoices/calculate/`; server totals are authoritative.
- Dates: API format is `YYYY-MM-DD`; convert dayjs → API via `utils/date.toApiDate`; display via `formatDate`. Validate `from <= to` before sending (`isValidRange`).
- Payment `client_token`: generate one UUID per form instance with `generateClientToken()`, reuse on retries, regenerate only after success.
- Invoice status drives UI: `DRAFT` → Edit / Issue; `ISSUED` → read-only, Print PDF, Generate Challan, Awaiting Dispatch.

---

## 9. Forms

- `react-hook-form` + `zod` (`zodResolver`); schemas in `src/schemas/`; type from `z.infer`.
- Use the `Form*` components (RHF-bound MUI inputs). No uncontrolled ad-hoc `<TextField>` with local `useState` for form data.
- Map form values → API request via a **pure mapper function** (empty optional strings → `undefined`, omit service-only fields, etc.) and unit-test it.
- Server errors: `useApiFormErrors` maps `field_errors` to fields; remaining `detail` → `ApiErrorAlert`/snackbar.
- Disable submit while pending; show progress. Confirm irreversible actions with `ConfirmDialog`.
- Do not send read-only/auto-generated fields (`code`, `current_stock`, totals).

---

## 10. Auth, roles, errors

- Boot: `GET /auth/csrf/` → `GET /auth/me/`. 401 → login. Guard routes with `ProtectedRoute`; admin pages with `RoleRoute`; hide admin UI with `RoleGate`. **Gate both route and UI.** The backend remains the authority.
- Always use `parseApiError`; never read `error.data` ad hoc. Branch on `code` constants, not on message text.
- Contract error codes get purposeful UX: `INSUFFICIENT_STOCK`, `OVER_DISPATCH`, `OVER_ALLOCATION`, `INVALID_DATE_RANGE`, `THROTTLED`, `PERMISSION_DENIED`, `NOT_AUTHENTICATED`.
- Never log secrets/passwords; remove `console.log` before finishing (use none in committed code).

---

## 11. Lists, filters, files

- Lists use `DataTable<T>` with typed `columns`, server pagination (`page`, `page_size` ≤ 100), and `usePaginationParams` (state in URL). Search inputs are debounced via `useDebounce`.
- Filter params mirror the contract exactly (`search`, `is_active`, `item_type`, `low_stock`, `status`, `customer`, `from`, `to`, …). Define a typed params interface per list.
- Files (PDF/XLSX): `useFileDownload` + `utils/download.ts`; always revoke object URLs; surface failures via snackbar.
- Totals shown above lists (e.g. `total_amount` on expenses/income) come from the API, not client sums.

---

## 12. Code style

- Functional components + hooks only. Named exports for components (default export only for lazy-loaded pages if the router requires it).
- Naming: `PascalCase` components/types, `camelCase` functions/vars, `UPPER_SNAKE_CASE` constants, `useX` hooks, `XxxPage` pages, `xxxApi.ts` endpoints, `xxxSlice.ts` slices.
- Use the `@/` path alias; no deep relative imports (`../../../`).
- Imports ordered: react → third-party → `@/` internal → relative; no unused imports/vars; no commented-out code; no dead code.
- Memoize (`useMemo`/`useCallback`/`React.memo`) only for demonstrably expensive or referentially-sensitive cases, not by default.
- Lazy-load route pages (`React.lazy`).
- Prettier + ESLint must be clean with zero warnings.

---

## 13. Testing

- Vitest for utils, schemas, mappers, allocation logic, `parseApiError`.
- React Testing Library + MSW for key flows (login, invoice create → issue, payment allocation).
- Test behaviour, not implementation; no snapshot spam. New util ⇒ new test.

---

## 14. Pre-completion checklist (run on every change)

- [ ] No `any`, no `!`, no `@ts-ignore`, no app-level `null` (DTO-boundary exceptions only).
- [ ] Reused existing components/hooks/utils; no duplication; pages are thin.
- [ ] MUI only, theme tokens only (no hex colors / magic px).
- [ ] API through RTK Query with correct tags; client state only in slices.
- [ ] No hardcoded routes, enums, labels, messages, error codes, page sizes, URLs.
- [ ] Shared logic lives in `utils/` or `hooks/` and has tests.
- [ ] Money/qty are strings, handled only via `utils/money` + `utils/format`; no client-side GST math.
- [ ] Loading / empty / error / success states present; server field errors mapped.
- [ ] Role guard + UI gating applied where required.
- [ ] `tsc --noEmit`, ESLint, Prettier, tests all pass.
- [ ] Undocumented API shapes were **asked about**, not guessed.

---

## 15. Anti-patterns (reject on sight)

- `useEffect` + `fetch/axios` for data loading.
- Storing API lists in Redux slices or `useState` copies of query data.
- `const [x, setX] = useState<any>(null)`.
- `parseFloat(invoice.grand_total) * 1.18`.
- `navigate('/invoices/' + id)` or `status === 'ISSUED'` string literals.
- Copy-pasted table/dialog/form per page.
- Inline hex colors, `style={{...}}` with px values, non-MUI buttons/inputs.
- Catching errors with `catch (e: any)` or showing raw `error.message`.
- Generating a payment `client_token` on every submit click.
- Auth tokens or user credentials in `localStorage`.
