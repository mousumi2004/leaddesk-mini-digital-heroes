# LeadDesk Mini Green Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved original green visual system, replace inline briefs with an accessible detail pane, remove the footer link and “L” marks, and safely enrich the six existing lead messages.

**Architecture:** Keep the existing Next.js App Router and Firebase architecture. Add one focused client-side dialog component that receives the already-loaded selected lead, retain dashboard state and API behaviour, and implement all visual motion in the existing global stylesheet with reduced-motion fallbacks. Update production lead messages through a guarded local migration script that performs an atomic Firestore batch and changes no other fields.

**Tech Stack:** Next.js 16.2 App Router, React 19, TypeScript, CSS, Firebase Admin/Cloud Firestore, Vitest, Testing Library, Playwright, Vercel

---

## File Map

- Modify `components/site/footer.tsx`: render a non-linked text wordmark and retain the required external credit.
- Modify `app/page.tsx`: remove the circular “L” mark while retaining the header wordmark.
- Create `components/admin/lead-detail-dialog.tsx`: accessible, scrollable, dismissible lead-detail pane.
- Modify `components/admin/admin-dashboard.tsx`: replace inline expansion state with selected-lead pane state.
- Modify `app/globals.css`: apply the green palette, original background motion, hover motion, pane styling, responsive rules, and reduced-motion rules.
- Modify `tests/components/site-shell.test.tsx`: lock the wordmark and credit semantics.
- Modify `tests/components/admin-dashboard.test.tsx`: lock dialog content and dismissal behaviour.
- Modify `tests/e2e/leaddesk.spec.ts`: verify the production-facing pane workflow.
- Create `scripts/enrich-lead-briefs.mjs`: guarded, atomic six-message Firestore update.
- Modify `README.md`: retain the existing project documentation while noting the detail-pane interaction.

### Task 1: Lock the Branding Behaviour

**Files:**
- Modify: `tests/components/site-shell.test.tsx`
- Modify: `components/site/footer.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the failing shell test**

Replace the link-count assertion with:

```tsx
expect(screen.getByRole("link", { name: "LeadDesk Mini" })).toBeVisible();
expect(
  screen.getByText("LeadDesk Mini", { selector: "span.brand" }),
).toBeVisible();
expect(
  screen.queryByText("L", { selector: ".brand-mark" }),
).not.toBeInTheDocument();
expect(
  screen.getByRole("link", {
    name: "Built for Digital Heroes Training Task",
  }),
).toHaveAttribute("href", "https://digitalheroesco.com");
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```powershell
pnpm vitest run tests/components/site-shell.test.tsx
```

Expected: FAIL because the footer wordmark is still a link and `.brand-mark` still exists.

- [ ] **Step 3: Implement the text-only wordmark**

Use this footer structure:

```tsx
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="brand small">LeadDesk Mini</span>
        <a
          className="training-credit"
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Built for Digital Heroes Training Task
        </a>
      </div>
    </footer>
  );
}
```

Remove the `.brand-mark` span from the public header while keeping the `LeadDesk Mini` header link.

- [ ] **Step 4: Run the shell test**

Run:

```powershell
pnpm vitest run tests/components/site-shell.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add app/page.tsx components/site/footer.tsx tests/components/site-shell.test.tsx
git commit -m "refactor: simplify LeadDesk wordmark"
```

### Task 2: Replace Inline Briefs with a Detail Pane

**Files:**
- Create: `components/admin/lead-detail-dialog.tsx`
- Modify: `components/admin/admin-dashboard.tsx`
- Modify: `tests/components/admin-dashboard.test.tsx`

- [ ] **Step 1: Replace the expansion test with failing dialog tests**

Add tests that open Mousumi Swain’s brief and assert:

```tsx
await user.click(
  screen.getByRole("button", {
    name: "View full brief from Mousumi Swain",
  }),
);

const dialog = screen.getByRole("dialog", {
  name: "Project brief from Mousumi Swain",
});
expect(dialog).toBeVisible();
expect(within(dialog).getByText("mousumi@example.com")).toBeVisible();
expect(within(dialog).getByText("$1,000 - $5,000")).toBeVisible();
expect(within(dialog).getByText("New")).toBeVisible();
expect(dialog).toHaveTextContent(
  "I need a responsive Shopify storefront for my clothing brand.",
);
```

Add separate close-button and Escape tests:

```tsx
await user.click(
  within(dialog).getByRole("button", {
    name: "Close project brief",
  }),
);
expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

await user.keyboard("{Escape}");
expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the dashboard test and verify failure**

Run:

```powershell
pnpm vitest run tests/components/admin-dashboard.test.tsx
```

Expected: FAIL because the current interface renders an inline region, not a dialog.

- [ ] **Step 3: Create the focused dialog component**

Create a client component with this public interface and content:

```tsx
import { Mail, X } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  budgetLabels,
  statusLabels,
  type LeadRecord,
} from "@/lib/leads/schema";

type LeadDetailDialogProps = {
  lead: LeadRecord;
  onClose: () => void;
};

export function LeadDetailDialog({
  lead,
  onClose,
}: LeadDetailDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div
      className="lead-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="lead-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`lead-dialog-title-${lead.id}`}
      >
        <button
          ref={closeButtonRef}
          className="lead-dialog-close"
          type="button"
          aria-label="Close project brief"
          onClick={onClose}
        >
          <X aria-hidden="true" size={20} />
        </button>
        <span className="eyebrow">Project enquiry</span>
        <h2 id={`lead-dialog-title-${lead.id}`}>
          Project brief from {lead.name}
        </h2>
        <a className="lead-dialog-email" href={`mailto:${lead.email}`}>
          <Mail aria-hidden="true" size={16} />
          {lead.email}
        </a>
        <dl className="lead-dialog-meta">
          <div>
            <dt>Budget</dt>
            <dd>{budgetLabels[lead.budget]}</dd>
          </div>
          <div>
            <dt>Received</dt>
            <dd>{formatLeadDate(lead.createdAt)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{statusLabels[lead.status]}</dd>
          </div>
        </dl>
        <div className="lead-dialog-brief">
          <span>Full brief</span>
          <p>{lead.message}</p>
        </div>
      </section>
    </div>
  );
}

function formatLeadDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
```

Use the existing `budgetLabels`, `statusLabels`, and date formatting rather than duplicating labels.

- [ ] **Step 4: Connect selected-lead state**

Replace `expandedLeadIds` with:

```tsx
const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
const returnFocusRef = useRef<HTMLButtonElement | null>(null);

function openLeadDetails(
  lead: LeadRecord,
  trigger: HTMLButtonElement,
) {
  returnFocusRef.current = trigger;
  setSelectedLead(lead);
}

function closeLeadDetails() {
  setSelectedLead(null);
  window.requestAnimationFrame(() => returnFocusRef.current?.focus());
}
```

Every row keeps one stable “View full brief” button. Render one `LeadDetailDialog` after the lead table when `selectedLead` is non-null.

- [ ] **Step 5: Run focused tests**

Run:

```powershell
pnpm vitest run tests/components/admin-dashboard.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add components/admin/lead-detail-dialog.tsx components/admin/admin-dashboard.tsx tests/components/admin-dashboard.test.tsx
git commit -m "feat: add accessible lead detail pane"
```

### Task 3: Apply the Original Green Visual System

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add palette tokens and original motion**

Replace the blue/amber brand tokens with:

```css
:root {
  --sage-500: #6fa37a;
  --sage-300: #a1c4ab;
  --forest-700: #3f6b54;
  --forest-950: #12271e;
  --cream-50: #fbfaf5;
  --cream-100: #f4f2e9;
  --ink-900: #17221c;
  --canvas: var(--cream-50);
}

@keyframes grid-drift {
  from { background-position: 0 0; }
  to { background-position: 36px 36px; }
}

@keyframes glow-breathe {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(10px, -8px, 0) scale(1.04); }
}
```

Use a low-opacity dotted background based on `radial-gradient`, slow 18–24 second movement, and restrained green glows. Keep movement in pseudo-elements so it cannot block input.

- [ ] **Step 2: Restyle all three surfaces**

Update existing selectors rather than restructuring pages:

- Public header, hero, form, process cards, buttons and footer use the new palette.
- Login backdrop and card use the same cream/forest/sage relationship.
- Dashboard background, summary cards, filters, table, status controls and alerts use the same tokens.
- `.brand` becomes a text wordmark with heavier weight, tighter tracking and no badge.
- Hover transforms never exceed `translateY(-2px)`.
- Focus rings use a high-contrast forest/sage outline.

- [ ] **Step 3: Style the lead pane**

Add:

```css
.lead-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  justify-items: end;
  background: rgba(10, 25, 18, 0.42);
  backdrop-filter: blur(6px);
  animation: dialog-backdrop-in 180ms ease-out both;
}

.lead-dialog {
  width: min(720px, calc(100vw - 32px));
  height: 100%;
  overflow-y: auto;
  background: var(--cream-50);
  border-left: 1px solid rgba(63, 107, 84, 0.22);
  box-shadow: -24px 0 64px rgba(18, 39, 30, 0.2);
  animation: dialog-pane-in 220ms ease-out both;
}
```

Add responsive rules that use nearly the full viewport width on mobile.

- [ ] **Step 4: Preserve reduced-motion behaviour**

Extend the existing reduced-motion query:

```css
@media (prefers-reduced-motion: reduce) {
  .hero::before,
  .dashboard-page::before,
  .auth-backdrop,
  .lead-dialog,
  .lead-dialog-backdrop {
    animation: none !important;
  }
}
```

- [ ] **Step 5: Run unit tests and build**

Run:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: every command exits 0.

- [ ] **Step 6: Commit**

```powershell
git add app/globals.css
git commit -m "style: apply original green visual system"
```

### Task 4: Enrich the Six Existing Lead Messages Safely

**Files:**
- Create: `scripts/enrich-lead-briefs.mjs`

- [ ] **Step 1: Create a guarded category mapper**

The script must:

1. Load Firebase Admin credentials from the existing server environment.
2. Read every document in `leads`.
3. Require exactly six documents.
4. Classify each current message into exactly one of: AI travel planner, anti-impulse shopping, gym campaign, student career platform, Shopify brand launch, or Shopify redesign.
5. Produce an original 100–180 word brief for that project type.
6. Reject any output over the schema’s 1,000-character maximum.
7. Use one Firestore batch that updates only `message`.
8. Read the six documents back and verify all non-message fields equal the before snapshot.

Use these category outputs:

```js
const enrichedBriefs = {
  aiTravel:
    "I want to build an AI-powered travel planning application for people who find trip research overwhelming. A user should be able to enter their destination, travel dates, budget, interests, preferred pace, and who they are travelling with. The product should return a practical day-by-day itinerary with suggested attractions, travel time between stops, estimated daily costs, food recommendations, and alternatives for bad weather. Users should be able to edit the plan, save favourite places, and share the final itinerary. The interface must be mobile-first, simple for first-time users, and transparent that recommendations are AI-assisted. For the first release, I would like a polished planner flow, saved trips, and a lightweight administrator view for monitoring usage and feedback.",
  antiImpulse:
    "I need a responsive “de-influence” dashboard and anti-impulse shopping companion that helps users pause before purchasing products they discover online. Users should be able to save a product, record its price and reason for wanting it, start a cooling-off timer, compare it with items they already own, and review the longer-term cost. The dashboard should show avoided purchases, money saved, active waiting periods, and personal shopping patterns without making the experience judgmental. I also want prompts that encourage users to consider durability, realistic usage, and cheaper alternatives. The visual direction should feel calm and trustworthy rather than like another shopping platform. The first version should include onboarding, saved items, decision reminders, simple insights, and a mobile-friendly experience.",
  gymCampaign:
    "We need a high-conversion campaign website for a gym launching a new membership drive. The page should clearly explain the gym’s training options, facilities, trainer support, class schedule, membership plans, and limited-time joining offer. Visitors should be able to request a trial session or membership consultation through a short form, with enquiries routed to the gym team for follow-up. The campaign should include strong mobile layouts, authentic transformation stories, trainer profiles, frequently asked questions, location details, and prominent calls to action without feeling aggressive. We also need basic analytics-ready structure so the team can understand which campaign sections generate enquiries. The finished site should load quickly, remain accessible, and be easy to update for future seasonal offers.",
  careerPlatform:
    "I want to build a career platform for students and fresh graduates who struggle to find relevant early-career opportunities. Users should be able to create a skills-based profile, discover internships and entry-level roles, save opportunities, track each application stage, and receive deadline reminders. Recommendations should consider skills, interests, preferred work mode, location, and experience level while still allowing users to browse freely. The administrator area should support posting and editing opportunities, reviewing engagement, and identifying expired listings. The platform must be responsive, accessible, fast on low-cost mobile devices, and clear enough for first-time job seekers. For the initial release, I would like profile onboarding, opportunity discovery, saved roles, application tracking, reminders, and a focused administrator dashboard.",
  shopifyLaunch:
    "I need a Shopify store for a growing product brand that is ready to begin selling online. The store should include a polished homepage, collection and product pages, search, cart, checkout setup, customer policies, contact information, and essential trust content. Product pages need clear imagery, variants, pricing, delivery information, and space for customer reviews. I also want the store organised so the team can add products and update banners without developer support. The design should feel distinctive to the brand, work smoothly on mobile, and keep the path to purchase simple. Please include payment and shipping configuration, basic analytics, SEO-ready page structure, and launch testing across common devices. The first phase should focus on a reliable, professional storefront rather than unnecessary custom features.",
  shopifyRedesign:
    "I want to rebuild an existing Shopify storefront that currently feels generic and is difficult to browse on mobile. The redesign should improve the homepage hierarchy, collection navigation, product discovery, product-page clarity, and the cart experience while preserving the existing catalogue and customer-facing policies. We need flexible promotional sections, stronger product imagery, variant and delivery information, reviews, related products, and clearer calls to action. The new theme should be easy for the internal team to maintain through Shopify’s editor, with reusable sections instead of hardcoded page content. Please also review responsive behaviour, page speed, basic SEO structure, analytics continuity, and checkout handoff before launch. The goal is a cleaner branded experience that increases confidence without adding distracting effects or unnecessary applications.",
};
```

Use this update shape:

```js
const batch = db.batch();
for (const item of plannedUpdates) {
  batch.update(item.reference, { message: item.nextMessage });
}
await batch.commit();
```

Do not write `status`, `createdAt`, `updatedAt`, `name`, `email`, `budget`, or document IDs.

- [ ] **Step 2: Run the guarded migration**

Run:

```powershell
node scripts/enrich-lead-briefs.mjs
```

Expected output:

```text
Verified 6 leads.
Planned 6 message-only updates.
Committed 6 message-only updates.
Read-back verification passed: 6/6.
```

- [ ] **Step 3: Remove private operational details**

Confirm the script contains no credentials, email addresses, passwords, private keys, or copied personal data:

```powershell
rg -n "PRIVATE KEY|PASSWORD|@gmail|FIREBASE_ADMIN_PRIVATE_KEY" scripts/enrich-lead-briefs.mjs
```

Expected: no matches.

- [ ] **Step 4: Commit**

```powershell
git add scripts/enrich-lead-briefs.mjs
git commit -m "chore: add guarded lead brief enrichment"
```

### Task 5: Browser Flow, Documentation and Deployment

**Files:**
- Modify: `tests/e2e/leaddesk.spec.ts`
- Modify: `README.md`

- [ ] **Step 1: Update the E2E pane flow**

Replace inline expansion assertions with:

```ts
await page.getByRole("button", { name: /View full brief from/ }).first().click();
await expect(
  page.getByRole("dialog", { name: /Project brief from/ }),
).toBeVisible();
await expect(
  page.getByRole("button", { name: "Close project brief" }),
).toBeVisible();
```

Keep submission, login, search, filter, status-change and persistence coverage unchanged.

- [ ] **Step 2: Update README interaction documentation**

State that administrators can open a scrollable detail pane for the full lead context. Keep the data-model, authentication, setup and deployment explanations unchanged.

- [ ] **Step 3: Run the complete verification gate**

Run:

```powershell
pnpm verify
pnpm test:e2e
```

Expected: lint, type checking, unit/component/API tests, build and E2E all pass.

- [ ] **Step 4: Inspect the local UI**

Verify desktop and mobile:

- Landing page green palette, wordmark, form, animations and footer credit.
- Login page palette and authentication.
- Dashboard counts, filters, search, detail pane, close methods and status persistence.
- No circular “L” marks.
- Footer LeadDesk Mini text is not interactive.
- Required Digital Heroes credit remains linked.
- Reduced-motion mode removes decorative motion.

- [ ] **Step 5: Commit and push**

```powershell
git add tests/e2e/leaddesk.spec.ts README.md
git commit -m "test: verify refined lead workflow"
git push origin main
```

- [ ] **Step 6: Deploy and verify production**

Run:

```powershell
vercel --prod --yes
```

Verify the deployed landing, login and admin pages from a fresh browser. Confirm the six enriched messages are visible through the correct detail panes.
