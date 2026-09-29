# Testing Strategy & Implementation Plan

This document outlines the testing strategy, prioritized list of tests, and industry best practices for achieving comprehensive test coverage in the Cognitree APPSEC application.

## Priority Order (Execution Plan)

When aiming for 100% coverage, do not test randomly. Follow this priority order to ensure the most critical business value is protected first.

### Priority 0: Critical User Journeys (E2E)
*If these fail, the application is fundamentally broken for the user.*
**Tool:** Playwright (`e2e/`)

- [x] `login.spec.ts`: User can log in and reach the dashboard.
- [ ] `dashboard-filters.spec.ts`: User can search, filter by severity, and paginate the findings list.
- [ ] `finding-workflow.spec.ts`: User can click a finding, view its details, and change its status.
- [ ] `reports.spec.ts`: User can generate a security report and see the success state.

### Priority 1: Connected "Smart" Components & Routing (Integration)
*These tests ensure our components wire up correctly with TanStack Query and Global State.*
**Tool:** Vitest + React Testing Library + MSW (`src/components/dashboard/`)

- [ ] `FindingsList.test.tsx`: Renders table rows from mock API, handles empty states, triggers sorting.
- [ ] `FindingDetailPanel.test.tsx`: Loads detailed data for a specific ID and renders description/remediation.
- [ ] `VulnerabilityOverview.test.tsx`: Correctly aggregates and passes mock stats to child charts.
- [ ] `ProtectedRoute.test.tsx`: Redirects unauthenticated users to `/login`.

### Priority 2: Core Logic & Custom Hooks (Unit)
*Testing the brain of the application without UI overhead.*
**Tool:** Vitest + React Testing Library (`renderHook`)

- [ ] `store/dashboardStore.test.ts`: Zustand actions correctly update `filters`, `pagination`, and `selectedFinding`.
- [ ] `hooks/useFindings.test.ts`: Correctly extracts `data` from the successful API response and handles `isPending`.
- [ ] `lib/api.test.ts`: Fetch wrappers attach correct authorization headers and throw proper JS Errors on 401/500 status codes.
- [ ] `pages/LoginPage.test.tsx`: Form validation (empty fields) and displaying API error messages (e.g., Invalid Credentials).

### Priority 3: "Dumb" UI Components (Unit)
*High volume, easy to write. Focus on props and events.*
**Tool:** Vitest + React Testing Library (`src/components/ui/`)

- [ ] `SeverityBadge.test.tsx`: Renders correct color/icon based on `"CRITICAL" | "HIGH"` props.
- [ ] `FilterDropdown.test.tsx`: Renders options and fires `onChange` mock when an option is clicked.
- [ ] `SearchInput.test.tsx`: Debounces input and fires `onChange`.
- [ ] `Pagination.test.tsx`: Fires correct page number on 'Next' / 'Previous' clicks.
- [ ] `Modal.test.tsx`: Renders children when `isOpen=true`, fires `onClose` on overlay click or Escape key.

---

## 🏆 React Testing Library Best Practices

### 1. The Query Priority Rule
Always find elements the way a real user with a screen reader would find them.
1. **`getByRole`**: Your go-to. (e.g., `getByRole('button', { name: 'Sign In' })`)
2. **`getByLabelText`**: Best for form inputs. (e.g., `getByLabelText('Email Address')`)
3. **`getByPlaceholderText`**: Acceptable, but fragile if UI copy changes.
4. **`getByText`**: Good for checking static non-interactive text.
5. **`getByTestId`**: Last resort. Only use if the element is impossible to target otherwise.

### 2. User Interactions
**Never** use `fireEvent`. Always use the modern `user-event` v14 library, which accurately simulates real browser events (like focus, blur, and keyboard state).
```tsx
// ❌ Bad (Legacy)
fireEvent.click(button);

// ✅ Good (Modern)
const user = userEvent.setup();
await user.click(button);
```

### 3. API Mocking
**Never** use `vi.mock('fetch')` or mock Axios directly.
Always use **MSW (Mock Service Worker)**. It intercepts requests at the network level, meaning your React Query hooks and `fetch` wrappers execute their actual code paths.

### 4. Test the Output, Not the Implementation
Do not try to test internal component state (e.g., `expect(component.state.isOpen).toBe(true)`). 
Test what the user actually sees:
```tsx
// ✅ Test the DOM output
expect(screen.getByText('Modal Content')).toBeVisible();
```

### 5. `getBy...` vs `queryBy...` vs `findBy...`
- `getBy...`: Use when the element **must** be there instantly. Fails immediately if not found.
- `queryBy...`: Use to assert an element is **NOT** there. (e.g., `expect(screen.queryByText('Error')).not.toBeInTheDocument()`)
- `findBy...`: Use with `await` when an element will appear asynchronously (e.g., after a loading spinner disappears).
