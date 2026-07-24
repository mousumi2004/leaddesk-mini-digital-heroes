# LeadDesk Mini Final Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved navy-and-gold visual polish, accessible form jump, administrator status filters, complete lead-detail expansion, and verified production deployment without changing the secure backend architecture.

**Architecture:** Keep the existing Next.js App Router, Firebase, and server-route architecture unchanged. Add one focused client interaction component for the public form jump, enhance the existing client dashboard with local presentation state, and implement the visual direction in the already-global stylesheet imported by the root layout.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Geist via `next/font`, Lucide React, Vitest, Testing Library, Playwright, Firebase, Vercel.

---

## File Map

- Create `components/site/form-jump-link.tsx`: accessible public call-to-action that scrolls to and focuses the form heading.
- Create `tests/components/form-jump-link.test.tsx`: verifies the call-to-action target and focus behavior.
- Create `tests/components/site-shell.test.tsx`: verifies public-page and footer accessibility semantics.
- Modify `app/page.tsx`: use the form-jump component, expose decorative step numbers correctly, and remove the redundant brand label.
- Modify `components/lead/lead-form.tsx`: make the form heading a focusable fragment target.
- Modify `components/site/footer.tsx`: let the visible brand text provide the link’s accessible name.
- Modify `components/admin/admin-dashboard.tsx`: add combined status/search filtering and accessible complete-message expansion.
- Modify `tests/components/admin-dashboard.test.tsx`: cover filter, combined-filter, empty-state, and detail-expansion behavior.
- Modify `tests/e2e/leaddesk.spec.ts`: verify the public jump/focus and the complete production administrator workflow.
- Modify `app/globals.css`: implement the approved visual system, workflow treatment, filter controls, detail expansion, contrast, responsive behavior, and reduced-motion handling.
- Modify `README.md`: document the focused differentiators and refresh production screenshots after verification.
- Refresh `output/playwright/public-desktop.png`, `output/playwright/public-mobile.png`, and `output/playwright/login-desktop.png`; add `output/playwright/admin-desktop.png`.

The plan intentionally does not modify API routes, Firebase repositories,
Firestore rules, authentication, authorization, data schemas, or deployment
secrets.

### Task 1: Accessible public form jump and shell semantics

**Files:**
- Create: `components/site/form-jump-link.tsx`
- Create: `tests/components/form-jump-link.test.tsx`
- Create: `tests/components/site-shell.test.tsx`
- Modify: `app/page.tsx`
- Modify: `components/lead/lead-form.tsx`
- Modify: `components/site/footer.tsx`

- [ ] **Step 1: Write the failing form-jump component test**

Create `tests/components/form-jump-link.test.tsx`:

```tsx
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FormJumpLink } from "@/components/site/form-jump-link";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("FormJumpLink", () => {
  it("links to and focuses the project form heading", async () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    render(
      <>
        <FormJumpLink />
        <h2 id="project-form" tabIndex={-1}>
          Tell us what you&apos;re building.
        </h2>
      </>,
    );

    const user = userEvent.setup();
    const link = screen.getByRole("link", { name: "Share your project" });
    expect(link).toHaveAttribute("href", "#project-form");

    await user.click(link);

    expect(
      screen.getByRole("heading", { name: "Tell us what you're building." }),
    ).toHaveFocus();
  });
});
```

- [ ] **Step 2: Write the failing shell-semantics test**

Create `tests/components/site-shell.test.tsx`:

```tsx
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import Home from "@/app/page";
import { Footer } from "@/components/site/footer";

afterEach(cleanup);

describe("public shell semantics", () => {
  it("uses visible brand text as the accessible link name", () => {
    render(
      <>
        <Home />
        <Footer />
      </>,
    );

    expect(screen.getAllByRole("link", { name: "LeadDesk Mini" })).toHaveLength(
      2,
    );
    expect(
      screen.getByRole("link", {
        name: "Built for Digital Heroes Training Task",
      }),
    ).toHaveAttribute("href", "https://digitalheroesco.com");
  });

  it("marks visual step numbers as decorative", () => {
    const { container } = render(<Home />);

    expect(container.querySelectorAll(".step-number[aria-hidden='true']")).toHaveLength(
      3,
    );
  });
});
```

- [ ] **Step 3: Run the new tests and verify they fail**

Run:

```powershell
pnpm exec vitest run tests/components/form-jump-link.test.tsx tests/components/site-shell.test.tsx
```

Expected: FAIL because `FormJumpLink` does not exist and the current brand
links/step numbers do not have the approved semantics.

- [ ] **Step 4: Implement the focused form-jump component**

Create `components/site/form-jump-link.tsx`:

```tsx
"use client";

import { ArrowDown } from "lucide-react";

export function FormJumpLink() {
  function focusFormHeading() {
    window.requestAnimationFrame(() => {
      document.getElementById("project-form")?.focus({ preventScroll: true });
    });
  }

  return (
    <a
      className="text-link"
      href="#project-form"
      onClick={focusFormHeading}
    >
      Share your project
      <ArrowDown aria-hidden="true" size={17} />
    </a>
  );
}
```

- [ ] **Step 5: Update the public page semantics**

In `app/page.tsx`:

- Remove `ArrowDown` from the Lucide import.
- Import `FormJumpLink` from `@/components/site/form-jump-link`.
- Change the header brand to:

```tsx
<Link className="brand" href="/">
  <span className="brand-mark" aria-hidden="true">
    L
  </span>
  <span>LeadDesk Mini</span>
</Link>
```

- Replace the existing `Share your project` anchor with:

```tsx
<FormJumpLink />
```

- Remove `id="project-form"` from `.form-shell`.
- Add `aria-hidden="true"` to all three `.step-number` spans:

```tsx
<span className="step-number" aria-hidden="true">
  01
</span>
```

Repeat with `02` and `03`.

- [ ] **Step 6: Make the form heading the focusable target**

In `components/lead/lead-form.tsx`, change the form heading to:

```tsx
<h2 id="project-form" tabIndex={-1}>
  Tell us what you&apos;re building.
</h2>
```

- [ ] **Step 7: Correct the footer brand accessible name**

In `components/site/footer.tsx`, remove
`aria-label="LeadDesk Mini home"` from the footer brand link so the visible
`LeadDesk Mini` text supplies the accessible name.

- [ ] **Step 8: Run focused tests and verify they pass**

Run:

```powershell
pnpm exec vitest run tests/components/form-jump-link.test.tsx tests/components/site-shell.test.tsx tests/components/lead-form.test.tsx
```

Expected: all tests PASS.

- [ ] **Step 9: Commit the public interaction**

```powershell
git add -- app/page.tsx components/lead/lead-form.tsx components/site/footer.tsx components/site/form-jump-link.tsx tests/components/form-jump-link.test.tsx tests/components/site-shell.test.tsx
git commit -m "feat: refine accessible public lead journey"
```

### Task 2: Administrator status filters

**Files:**
- Modify: `components/admin/admin-dashboard.tsx`
- Modify: `tests/components/admin-dashboard.test.tsx`

- [ ] **Step 1: Extend the test data with a closed lead**

Append this record to the `leads` fixture in
`tests/components/admin-dashboard.test.tsx`:

```tsx
{
  id: "lead-3",
  name: "Nisha Rao",
  email: "nisha@example.com",
  budget: "10000-plus",
  message: "We need a multi-market e-commerce platform for our homeware brand.",
  status: "closed",
  createdAt: "2026-07-22T10:00:00.000Z",
  updatedAt: "2026-07-24T08:00:00.000Z",
},
```

Update the existing summary assertions to total `3` and closed `1`.

- [ ] **Step 2: Write failing filter tests**

Add to `tests/components/admin-dashboard.test.tsx`:

```tsx
it("filters leads by status", async () => {
  mockInitialLeads();
  render(<AdminDashboard adminEmail="admin@example.com" />);
  const user = userEvent.setup();
  await screen.findByText("Mousumi Swain");

  await user.click(screen.getByRole("button", { name: "Closed", exact: true }));

  expect(screen.getByText("Nisha Rao")).toBeVisible();
  expect(screen.queryByText("Mousumi Swain")).not.toBeInTheDocument();
  expect(screen.queryByText("Aarav Patel")).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Closed", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

it("combines status filtering with search", async () => {
  mockInitialLeads();
  render(<AdminDashboard adminEmail="admin@example.com" />);
  const user = userEvent.setup();
  await screen.findByText("Mousumi Swain");

  await user.click(
    screen.getByRole("button", { name: "Contacted", exact: true }),
  );
  await user.type(screen.getByRole("searchbox"), "mousumi");

  expect(screen.getByText("No matching leads")).toBeVisible();
  expect(
    screen.getByText("Change the status filter or search term and try again."),
  ).toBeVisible();
});
```

- [ ] **Step 3: Run the dashboard test and verify it fails**

Run:

```powershell
pnpm exec vitest run tests/components/admin-dashboard.test.tsx
```

Expected: FAIL because status filter buttons and combined filtering do not yet
exist.

- [ ] **Step 4: Add filter types, data, and state**

Near the top of `components/admin/admin-dashboard.tsx`, add:

```tsx
type StatusFilter = "all" | LeadStatus;

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];
```

Inside `AdminDashboard`, add:

```tsx
const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
```

Replace the current `filteredLeads` memo with:

```tsx
const filteredLeads = useMemo(() => {
  const normalized = query.trim().toLowerCase();

  return leads.filter((lead) => {
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    const matchesQuery =
      !normalized ||
      lead.name.toLowerCase().includes(normalized) ||
      lead.email.toLowerCase().includes(normalized);

    return matchesStatus && matchesQuery;
  });
}, [leads, query, statusFilter]);
```

- [ ] **Step 5: Render accessible filter controls**

Inside `.panel-toolbar`, between the title block and `.toolbar-actions`, add:

```tsx
<div className="status-filters" aria-label="Filter leads by status">
  {statusFilters.map((filter) => (
    <button
      type="button"
      key={filter.value}
      aria-pressed={statusFilter === filter.value}
      onClick={() => setStatusFilter(filter.value)}
    >
      {filter.label}
      <span aria-hidden="true">
        {filter.value === "all" ? counts.total : counts[filter.value]}
      </span>
    </button>
  ))}
</div>
```

Change the filtered empty-state copy to:

```tsx
<div className="dashboard-state">
  <Search aria-hidden="true" />
  <h3>No matching leads</h3>
  <p>Change the status filter or search term and try again.</p>
</div>
```

- [ ] **Step 6: Run dashboard tests and verify they pass**

Run:

```powershell
pnpm exec vitest run tests/components/admin-dashboard.test.tsx
```

Expected: all dashboard tests PASS.

- [ ] **Step 7: Commit status filtering**

```powershell
git add -- components/admin/admin-dashboard.tsx tests/components/admin-dashboard.test.tsx
git commit -m "feat: add focused lead status filters"
```

### Task 3: Accessible complete lead details

**Files:**
- Modify: `components/admin/admin-dashboard.tsx`
- Modify: `tests/components/admin-dashboard.test.tsx`

- [ ] **Step 1: Write the failing detail-expansion test**

Add to `tests/components/admin-dashboard.test.tsx`:

```tsx
it("expands and collapses the complete project brief", async () => {
  mockInitialLeads();
  render(<AdminDashboard adminEmail="admin@example.com" />);
  const user = userEvent.setup();
  await screen.findByText("Mousumi Swain");

  const toggle = screen.getByRole("button", {
    name: "View full brief from Mousumi Swain",
  });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(
    screen.queryByRole("region", {
      name: "Full project brief from Mousumi Swain",
    }),
  ).not.toBeInTheDocument();

  await user.click(toggle);

  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(
    screen.getByRole("region", {
      name: "Full project brief from Mousumi Swain",
    }),
  ).toHaveTextContent(
    "I need a responsive Shopify storefront for my clothing brand.",
  );

  await user.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
pnpm exec vitest run tests/components/admin-dashboard.test.tsx -t "expands and collapses"
```

Expected: FAIL because the expansion control does not exist.

- [ ] **Step 3: Add detail-expansion state and toggle**

Inside `AdminDashboard`, add:

```tsx
const [expandedLeadIds, setExpandedLeadIds] = useState<Set<string>>(
  () => new Set(),
);

function toggleLeadDetails(leadId: string) {
  setExpandedLeadIds((current) => {
    const next = new Set(current);
    if (next.has(leadId)) {
      next.delete(leadId);
    } else {
      next.add(leadId);
    }
    return next;
  });
}
```

- [ ] **Step 4: Render the preview, toggle, and full brief**

Inside the lead-person content block, replace the current message paragraph
with:

```tsx
<p className="lead-message-preview">{lead.message}</p>
<button
  className="lead-details-toggle"
  type="button"
  aria-expanded={expandedLeadIds.has(lead.id)}
  aria-controls={`lead-details-${lead.id}`}
  onClick={() => toggleLeadDetails(lead.id)}
>
  {expandedLeadIds.has(lead.id) ? "Hide full brief" : "View full brief"}
  <span className="sr-only"> from {lead.name}</span>
</button>
{expandedLeadIds.has(lead.id) ? (
  <div
    className="lead-details"
    id={`lead-details-${lead.id}`}
    role="region"
    aria-label={`Full project brief from ${lead.name}`}
  >
    <p>{lead.message}</p>
  </div>
) : null}
```

- [ ] **Step 5: Run all dashboard tests**

Run:

```powershell
pnpm exec vitest run tests/components/admin-dashboard.test.tsx
```

Expected: all tests PASS.

- [ ] **Step 6: Commit complete lead details**

```powershell
git add -- components/admin/admin-dashboard.tsx tests/components/admin-dashboard.test.tsx
git commit -m "feat: expose complete lead briefs"
```

### Task 4: Approved visual system and responsive polish

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Establish the approved typography and interaction base**

In `app/globals.css`, use the already-loaded Geist variable and native smooth
scrolling:

```css
html {
  min-height: 100%;
  scroll-behavior: smooth;
}

body {
  min-height: 100%;
  margin: 0;
  background: var(--canvas);
  color: var(--ink);
  font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif;
}

#project-form:focus {
  outline: 0;
}

.form-shell:has(#project-form:target) {
  animation: form-emphasis 900ms ease-out;
}
```

Add:

```css
@keyframes form-emphasis {
  0% {
    box-shadow:
      0 0 0 0 rgba(244, 185, 66, 0.48),
      0 30px 80px rgba(0, 0, 0, 0.33);
  }
  100% {
    box-shadow:
      0 0 0 12px rgba(244, 185, 66, 0),
      0 30px 80px rgba(0, 0, 0, 0.33);
  }
}
```

- [ ] **Step 2: Apply the restrained gold public accents**

Update the existing selectors with these declarations:

```css
.brand-mark {
  background: linear-gradient(145deg, #eaf2ff 8%, #f4b942 100%);
  box-shadow: 0 8px 22px rgba(244, 185, 66, 0.2);
}

.hero-pill {
  border-color: rgba(244, 185, 66, 0.28);
  background: rgba(244, 185, 66, 0.08);
  color: #f7cc72;
}

.hero h1 {
  max-width: 690px;
  font-size: clamp(2.65rem, 4.8vw, 4.65rem);
  line-height: 1.01;
  letter-spacing: -0.058em;
}

.benefit-list li span {
  color: #f4b942;
  background: rgba(244, 185, 66, 0.12);
  box-shadow: inset 0 0 0 1px rgba(244, 185, 66, 0.12);
}

.text-link {
  color: #f7c75f;
  text-decoration-color: rgba(247, 199, 95, 0.55);
}

.form-shell {
  border: 1px solid rgba(255, 255, 255, 0.68);
  box-shadow: 0 32px 88px rgba(0, 0, 0, 0.36);
}

.form-accent {
  background: linear-gradient(90deg, var(--blue-500) 0 58%, var(--amber-400));
}

.eyebrow {
  color: #1558d6;
}
```

- [ ] **Step 3: Restyle the three-step workflow**

Replace the current process-grid, process-card, icon, and step-number rules with:

```css
.process-section {
  padding: 88px 0 96px;
}

.section-heading {
  max-width: 680px;
  margin: 0 auto 46px;
  text-align: center;
}

.section-heading::before {
  content: "";
  display: block;
  width: 58px;
  height: 3px;
  margin: 0 auto 18px;
  border-radius: 99px;
  background: var(--amber-400);
}

.process-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.process-grid::before {
  content: "";
  position: absolute;
  top: 30px;
  right: 16%;
  left: 16%;
  border-top: 1px dashed #a9b7c9;
}

.process-grid article {
  position: relative;
  min-height: 210px;
  padding: 0 26px 28px;
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  text-align: center;
}

.process-grid article > svg {
  position: relative;
  z-index: 1;
  width: 62px;
  height: 62px;
  padding: 17px;
  border: 5px solid white;
  border-radius: 50%;
  color: white;
  background: var(--navy-900);
  box-shadow: 0 10px 28px rgba(7, 20, 39, 0.18);
}

.step-number {
  position: absolute;
  z-index: 2;
  top: 37px;
  left: calc(50% + 14px);
  width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  border: 3px solid white;
  border-radius: 50%;
  background: var(--amber-400);
  color: #432b00;
  font-size: 0.66rem;
  font-weight: 850;
  letter-spacing: 0;
}

.process-grid h3 {
  margin: 22px 0 9px;
}
```

- [ ] **Step 4: Style status filters and lead details**

Add:

```css
.status-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border: 1px solid #dbe3ee;
  border-radius: 11px;
  background: #f5f7fb;
}

.status-filters button {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #596a81;
  cursor: pointer;
  font-size: 0.74rem;
  font-weight: 720;
}

.status-filters button span {
  min-width: 19px;
  padding: 2px 5px;
  border-radius: 999px;
  background: #e4eaf3;
  color: #58687e;
  font-size: 0.65rem;
  text-align: center;
}

.status-filters button[aria-pressed="true"] {
  background: var(--navy-900);
  color: white;
  box-shadow: 0 5px 14px rgba(7, 20, 39, 0.16);
}

.status-filters button[aria-pressed="true"] span {
  background: rgba(244, 185, 66, 0.2);
  color: #ffd77d;
}

.lead-person > div {
  min-width: 0;
  width: 100%;
}

.lead-message-preview {
  max-width: 470px;
  margin: 7px 0 0;
  overflow: hidden;
  color: #6f7f94;
  font-size: 0.75rem;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lead-details-toggle {
  margin-top: 7px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #1558d6;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 730;
  text-decoration: underline;
  text-decoration-color: rgba(21, 88, 214, 0.34);
  text-underline-offset: 3px;
}

.lead-details {
  max-width: 500px;
  margin-top: 9px;
  padding: 11px 12px;
  border: 1px solid #dbe4ef;
  border-radius: 9px;
  background: #f8fafc;
}

.lead-details p {
  margin: 0;
  color: #465870;
  font-size: 0.76rem;
  line-height: 1.55;
  white-space: normal;
}
```

Remove or replace the old generic `.lead-person p` rule so it does not
override `.lead-message-preview` or `.lead-details p`.

- [ ] **Step 5: Add responsive behavior**

Inside `@media (max-width: 900px)`, add:

```css
.panel-toolbar {
  align-items: flex-start;
  flex-wrap: wrap;
}

.status-filters {
  order: 3;
  width: 100%;
  overflow-x: auto;
}
```

Inside `@media (max-width: 560px)`, add:

```css
.process-grid::before {
  display: none;
}

.process-grid article {
  padding-inline: 16px;
}

.status-filters button {
  flex: 1 0 auto;
}

.lead-message-preview,
.lead-details {
  max-width: none;
}
```

- [ ] **Step 6: Preserve reduced-motion behavior**

Inside `@media (prefers-reduced-motion: reduce)`, add:

```css
html {
  scroll-behavior: auto;
}

.form-shell:has(#project-form:target) {
  animation: none;
}
```

- [ ] **Step 7: Run static and component verification**

Run:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: every command exits `0`; all tests pass; the production build
completes.

- [ ] **Step 8: Commit visual polish**

```powershell
git add -- app/globals.css
git commit -m "style: apply approved LeadDesk visual polish"
```

### Task 5: Browser-flow coverage

**Files:**
- Modify: `tests/e2e/leaddesk.spec.ts`

- [ ] **Step 1: Extend the public browser test**

After the public heading assertion, add:

```tsx
const formJump = page.getByRole("link", { name: "Share your project" });
await expect(formJump).toHaveAttribute("href", "#project-form");
await formJump.click();
await expect(
  page.getByRole("heading", { name: "Tell us what you're building." }),
).toBeFocused();
```

- [ ] **Step 2: Extend the authenticated production journey**

After locating the generated lead, add:

```tsx
await page
  .getByRole("button", { name: "New", exact: true })
  .click();
await expect(page.getByText(leadName)).toBeVisible();

await page
  .getByRole("button", { name: `View full brief from ${leadName}` })
  .click();
await expect(
  page.getByRole("region", {
    name: `Full project brief from ${leadName}`,
  }),
).toContainText(
  "I need a responsive Shopify storefront for a clothing brand.",
);
```

After changing the status to closed, add:

```tsx
await page
  .getByRole("button", { name: "Closed", exact: true })
  .click();
await expect(page.getByText(leadName)).toBeVisible();
```

- [ ] **Step 3: Run local browser tests**

Run:

```powershell
pnpm test:e2e
```

Expected: public and route-protection tests PASS. The production journey skips
locally when administrator environment variables are absent.

- [ ] **Step 4: Commit browser coverage**

```powershell
git add -- tests/e2e/leaddesk.spec.ts
git commit -m "test: cover polished lead workflow"
```

### Task 6: Production deployment, evidence, and documentation

**Files:**
- Modify: `README.md`
- Refresh: `output/playwright/public-desktop.png`
- Refresh: `output/playwright/public-mobile.png`
- Refresh: `output/playwright/login-desktop.png`
- Create: `output/playwright/admin-desktop.png`

- [ ] **Step 1: Run the complete local gate**

Run:

```powershell
pnpm verify
pnpm test:e2e
git diff --check
git status --short
```

Expected: lint, type checking, every Vitest test, production build, and local
Playwright checks PASS; the worktree contains only the intended screenshot and
documentation updates.

- [ ] **Step 2: Deploy to the existing Vercel production project**

Run:

```powershell
npx vercel@56.5.0 --prod --yes
```

Expected: deployment state `Ready` and alias
`https://leaddesk-mini-digital-heroes.vercel.app`.

- [ ] **Step 3: Run the authenticated production journey**

Load `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` locally from the ignored
`submission-private/admin-credentials.txt` file without printing either value,
then run:

```powershell
$env:E2E_BASE_URL = "https://leaddesk-mini-digital-heroes.vercel.app"
pnpm test:e2e
```

Expected: all production Playwright tests PASS, including submission,
administrator login, status filter, complete brief, status update, refresh
persistence, and route protection.

- [ ] **Step 4: Capture final responsive evidence**

Capture the production public page at desktop and mobile widths, the login page
at desktop width, and the authenticated administrator dashboard at desktop
width. Save them to the exact `output/playwright` paths listed in the file map.

Expected: no clipped controls, no horizontal scrolling, readable footer
credit, correct navy/blue/gold styling, visible form, usable filters, and a
professional lead table.

- [ ] **Step 5: Run Lighthouse and manual accessibility checks**

Run Lighthouse against the production public page in mobile and desktop modes.
Manually verify keyboard order, the form jump, visible focus, status filters,
detail expansion, reduced motion, and exact footer destination.

Expected targets:

- Performance: at least 90 mobile and 95 desktop.
- Accessibility: 100 target; no known contrast or accessible-name violation.
- Best Practices: 100.
- SEO: 100.

If a score falls below its target, inspect the specific audit, fix only the
causal issue, rerun the relevant automated gate, redeploy, and repeat the audit.

- [ ] **Step 6: Update README evidence**

Add a concise `Product preview` section after the live links:

```markdown
## Product preview

### Public lead intake

![LeadDesk Mini public lead form](output/playwright/public-desktop.png)

### Protected administrator dashboard

![LeadDesk Mini administrator dashboard](output/playwright/admin-desktop.png)
```

Add these focused differentiators to `Assignment coverage`:

```markdown
- Combined administrator search and status filters
- Expandable, read-only complete project briefs
- Keyboard-aware form navigation and verified WCAG AA contrast
```

Do not change the AI-use paragraph or required footer statement unless
verification finds a factual inaccuracy.

- [ ] **Step 7: Audit repository safety**

Run:

```powershell
git status --short
git diff --check
git grep -n -I -E "PRIVATE KEY|E2E_ADMIN_PASSWORD|FIREBASE_PRIVATE_KEY|ADMIN_PASSWORD" -- . ":(exclude)pnpm-lock.yaml"
```

Expected: no credential value, private key, environment file, or generated
password is tracked. Environment-variable names in documentation are allowed;
secret values are not.

- [ ] **Step 8: Commit final evidence**

```powershell
git add -- README.md output/playwright/public-desktop.png output/playwright/public-mobile.png output/playwright/login-desktop.png output/playwright/admin-desktop.png
git commit -m "docs: add final production evidence"
```

- [ ] **Step 9: Push the verified main branch**

```powershell
git push origin main
```

Expected: the public GitHub repository contains the final source, plan,
screenshots, and documentation, with no secrets.

- [ ] **Step 10: Perform the final submission handoff**

Give Mousumi:

- The unchanged production URL.
- The public GitHub URL.
- The private administrator credential-file location.
- A short manual verification checklist.
- A Loom recording script covering public submission, login, search/filter,
  full brief, status change, refresh persistence, architecture, and AI use.
- Google Drive folder instructions and the recommended submission time.
