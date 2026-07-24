# LeadDesk Mini Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a secure lead-capture application with a public form, persistent Firebase data, authenticated administrator dashboard, search, status management, documentation, and verified submission assets.

**Architecture:** A single Next.js App Router application serves the public interface, administrator interface, and backend route handlers. Firebase Authentication supplies user identity; secure server-created session cookies and an `admins` collection provide authentication and authorization; Cloud Firestore stores leads. All privileged database work stays in server-only modules.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Firebase Authentication, Cloud Firestore, Firebase Admin SDK, Zod, React Hook Form, Vitest, Testing Library, Playwright, Vercel

---

## File Map

```text
app/
  api/
    auth/session/route.ts       Create and clear secure admin sessions
    leads/route.ts              Public lead creation and protected lead listing
    leads/[id]/route.ts         Protected status update
  admin/page.tsx                Protected dashboard shell
  login/page.tsx                Administrator sign-in page
  globals.css                   Tokens, responsive layout, and states
  layout.tsx                    Metadata, global structure, and required footer
  page.tsx                      Public landing page
components/
  admin/admin-dashboard.tsx     Search, counts, list, and status UI
  auth/login-form.tsx           Firebase sign-in and session exchange
  lead/lead-form.tsx            Public form and client validation
  site/footer.tsx               Exact Digital Heroes training credit
lib/
  auth/require-admin.ts         Session verification and role authorization
  firebase/admin.ts             Server-only Firebase Admin initialization
  firebase/client.ts            Browser Firebase initialization
  leads/repository.ts           Firestore lead operations
  leads/schema.ts               Shared validation, enums, and types
  security/csrf.ts              Login CSRF token creation and verification
scripts/
  provision-admin.mjs           Create/authorize the test administrator safely
tests/
  api/leads.test.ts             Lead API behavior
  lib/leads-schema.test.ts      Validation and normalization
  e2e/leaddesk.spec.ts          Fresh-browser critical journey
docs/
  database-setup.md             Firebase setup instructions
  submission-checklist.md       PDF-to-evidence audit and Mousumi's checks
.env.example                    Variable names only
README.md                       Public project documentation
vitest.config.ts                Unit/API test configuration
playwright.config.ts            Browser test configuration
```

### Task 1: Scaffold the application and quality commands

**Files:**
- Create: Next.js application files
- Create: `.gitignore`
- Create: `.env.example`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

- [ ] **Step 1: Scaffold with TypeScript, App Router, Tailwind, ESLint, and `src` disabled**

Run:

```powershell
& $nodeNpx create-next-app@latest . --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
```

Expected: application files are generated without overwriting `docs/`.

- [ ] **Step 2: Install runtime and test dependencies**

Run:

```powershell
npm install firebase firebase-admin zod react-hook-form @hookform/resolvers lucide-react server-only
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
```

Expected: dependencies are recorded in `package.json`.

- [ ] **Step 3: Add deterministic scripts**

`package.json` scripts must include:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "typecheck": "tsc --noEmit",
  "verify": "npm run lint && npm run typecheck && npm run test && npm run build"
}
```

- [ ] **Step 4: Configure Vitest**

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
  },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
})
```

`tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest"
```

- [ ] **Step 5: Add environment variable names without values**

`.env.example`:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
SESSION_COOKIE_NAME=leaddesk_session
```

- [ ] **Step 6: Verify the untouched scaffold**

Run:

```powershell
npm run lint
npm run typecheck
npm run build
```

Expected: all commands exit successfully.

- [ ] **Step 7: Commit**

```powershell
git add package.json package-lock.json app public .gitignore .env.example vitest.config.ts tests
git commit -m "chore: scaffold LeadDesk Mini"
```

### Task 2: Define and test the lead domain

**Files:**
- Create: `lib/leads/schema.ts`
- Create: `tests/lib/leads-schema.test.ts`

- [ ] **Step 1: Write failing validation tests**

Tests must prove:

```ts
expect(leadInputSchema.safeParse(validLead).success).toBe(true)
expect(leadInputSchema.safeParse({ ...validLead, email: "invalid" }).success).toBe(false)
expect(leadInputSchema.safeParse({ ...validLead, message: "short" }).success).toBe(false)
expect(leadInputSchema.safeParse({ ...validLead, budget: "unlisted" }).success).toBe(false)
expect(normalizeLeadInput({ ...validLead, email: "  USER@EXAMPLE.COM " }).email)
  .toBe("user@example.com")
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```powershell
npx vitest run tests/lib/leads-schema.test.ts
```

Expected: FAIL because the schema module does not exist.

- [ ] **Step 3: Implement the domain schema**

`lib/leads/schema.ts` must export:

```ts
export const budgetValues = [
  "under-1000",
  "1000-5000",
  "5000-10000",
  "10000-plus",
] as const

export const leadStatuses = ["new", "contacted", "closed"] as const

export const leadInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  budget: z.enum(budgetValues),
  message: z.string().trim().min(10).max(1000),
  company: z.string().max(0).optional().default(""),
}).strict()

export const statusUpdateSchema = z.object({
  status: z.enum(leadStatuses),
}).strict()
```

`normalizeLeadInput()` must trim strings and lowercase the email.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run:

```powershell
npx vitest run tests/lib/leads-schema.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add lib/leads/schema.ts tests/lib/leads-schema.test.ts
git commit -m "feat: define validated lead domain"
```

### Task 3: Add isolated Firebase clients and repository

**Files:**
- Create: `lib/firebase/admin.ts`
- Create: `lib/firebase/client.ts`
- Create: `lib/leads/repository.ts`
- Create: `tests/lib/leads-repository.test.ts`

- [ ] **Step 1: Write repository contract tests with a mocked Firestore adapter**

Tests must prove:

```ts
await repository.create(input)
expect(adapter.add).toHaveBeenCalledWith(expect.objectContaining({
  status: "new",
  email: "user@example.com",
}))

await repository.updateStatus("lead-1", "contacted")
expect(adapter.update).toHaveBeenCalledWith("lead-1", expect.objectContaining({
  status: "contacted",
}))
```

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
npx vitest run tests/lib/leads-repository.test.ts
```

Expected: FAIL because repository modules do not exist.

- [ ] **Step 3: Implement server-only Firebase initialization**

`lib/firebase/admin.ts` must:

- Import `server-only`.
- Reuse an existing Firebase Admin app when hot reloading.
- Replace escaped `\n` characters in the private key.
- Throw a concise configuration error when a required server variable is absent.
- Export `adminAuth` and `adminDb`.

- [ ] **Step 4: Implement browser Firebase initialization**

`lib/firebase/client.ts` must initialize from `NEXT_PUBLIC_FIREBASE_*` values and export `clientAuth`.

- [ ] **Step 5: Implement the repository boundary**

`lib/leads/repository.ts` must export:

```ts
createLead(input: LeadInput): Promise<{ id: string }>
listLeads(): Promise<LeadRecord[]>
updateLeadStatus(id: string, status: LeadStatus): Promise<void>
```

Server timestamps set both `createdAt` and `updatedAt`; public input never sets status or timestamps.

- [ ] **Step 6: Run repository and domain tests**

Run:

```powershell
npx vitest run tests/lib
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add lib/firebase lib/leads tests/lib
git commit -m "feat: add Firebase lead repository"
```

### Task 4: Build and test the public lead API

**Files:**
- Create: `app/api/leads/route.ts`
- Create: `tests/api/leads.test.ts`

- [ ] **Step 1: Write failing API tests**

Tests must cover:

```ts
expect((await POST(validRequest)).status).toBe(201)
expect((await POST(invalidEmailRequest)).status).toBe(400)
expect((await POST(honeypotRequest)).status).toBe(400)
expect(createLead).toHaveBeenCalledTimes(1)
```

The database failure case must return 500 without returning the thrown message.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
npx vitest run tests/api/leads.test.ts
```

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement `POST /api/leads`**

The route must:

```ts
const body = await request.json().catch(() => null)
const parsed = leadInputSchema.safeParse(body)
if (!parsed.success) {
  return Response.json({ error: "Please check the highlighted fields.", issues: parsed.error.flatten().fieldErrors }, { status: 400 })
}
const lead = normalizeLeadInput(parsed.data)
await createLead(lead)
return Response.json({ message: "Thanks - your project request has been received." }, { status: 201 })
```

The honeypot is rejected, unknown properties fail strict validation, and unexpected errors return only `Unable to save your request right now.`

- [ ] **Step 4: Run API tests**

Run:

```powershell
npx vitest run tests/api/leads.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add app/api/leads/route.ts tests/api/leads.test.ts
git commit -m "feat: add validated lead submission API"
```

### Task 5: Build the public experience and exact footer

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Create: `components/lead/lead-form.tsx`
- Create: `components/site/footer.tsx`
- Create: `tests/components/lead-form.test.tsx`

- [ ] **Step 1: Write failing form tests**

Tests must prove:

```ts
expect(screen.getByLabelText(/name/i)).toBeRequired()
expect(screen.getByLabelText(/email/i)).toBeRequired()
expect(screen.getByLabelText(/budget/i)).toBeRequired()
expect(screen.getByLabelText(/message/i)).toBeRequired()
expect(await screen.findByText(/valid email/i)).toBeVisible()
```

A successful mocked request must clear the form and announce the success message.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
npx vitest run tests/components/lead-form.test.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the form**

Use React Hook Form with the shared Zod schema. The submit handler posts JSON to `/api/leads`, disables duplicate submission, maps server issues back to fields, preserves values on failure, and resets only on success.

- [ ] **Step 4: Implement the landing page**

Copy must clearly state that LeadDesk Mini is a fictional small digital-agency intake tool for website and e-commerce project enquiries. It must not claim to be Digital Heroes or promise services on their behalf.

- [ ] **Step 5: Implement the footer as a dedicated component**

The rendered anchor must be exactly:

```tsx
<a href="https://digitalheroesco.com" target="_blank" rel="noreferrer">
  Built for Digital Heroes Training Task
</a>
```

- [ ] **Step 6: Run component tests and accessibility smoke checks**

Run:

```powershell
npx vitest run tests/components/lead-form.test.tsx
npm run lint
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add app components tests/components
git commit -m "feat: build responsive public lead experience"
```

### Task 6: Implement secure administrator sessions

**Files:**
- Create: `lib/security/csrf.ts`
- Create: `lib/auth/require-admin.ts`
- Create: `app/api/auth/session/route.ts`
- Create: `tests/api/session.test.ts`

- [ ] **Step 1: Write failing session tests**

Tests must prove:

```ts
expect((await createSession(missingTokenRequest)).status).toBe(400)
expect((await createSession(invalidCsrfRequest)).status).toBe(403)
expect((await createSession(nonAdminRequest)).status).toBe(403)
expect((await createSession(validAdminRequest)).status).toBe(204)
expect(validResponse.headers.get("set-cookie")).toContain("HttpOnly")
```

Logout must expire the cookie.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
npx vitest run tests/api/session.test.ts
```

Expected: FAIL because auth modules do not exist.

- [ ] **Step 3: Implement CSRF protection**

`GET /api/auth/session` creates a cryptographically random token, stores it in a non-HTTP-only same-site CSRF cookie, and returns the same token to the login form. `POST /api/auth/session` requires the body and cookie values to match using a timing-safe equality check and rejects cross-origin requests.

- [ ] **Step 4: Implement authorization**

`requireAdmin()` must:

1. Read the named session cookie.
2. Verify it with Firebase Admin Auth.
3. Read `admins/{uid}`.
4. Require `role === "admin"`.
5. Return the verified UID and email or throw a typed 401/403 error.

- [ ] **Step 5: Implement login and logout routes**

Login verifies a recent ID token, checks admin authorization, and creates a five-day HTTP-only, secure-in-production, same-site cookie. Logout expires that cookie.

- [ ] **Step 6: Run session tests**

Run:

```powershell
npx vitest run tests/api/session.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add lib/auth lib/security app/api/auth tests/api/session.test.ts
git commit -m "feat: add secure administrator sessions"
```

### Task 7: Add authenticated lead listing and status APIs

**Files:**
- Modify: `app/api/leads/route.ts`
- Create: `app/api/leads/[id]/route.ts`
- Create: `tests/api/admin-leads.test.ts`

- [ ] **Step 1: Write failing protected-operation tests**

Tests must prove:

```ts
expect((await GET(unauthenticatedRequest)).status).toBe(401)
expect((await GET(adminRequest)).status).toBe(200)
expect((await PATCH(invalidStatusRequest, context)).status).toBe(400)
expect((await PATCH(adminRequest, context)).status).toBe(200)
expect(updateLeadStatus).toHaveBeenCalledWith("lead-1", "closed")
```

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
npx vitest run tests/api/admin-leads.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement protected `GET /api/leads`**

Call `requireAdmin()` before the repository. Return a stable JSON representation with ISO timestamp strings.

- [ ] **Step 4: Implement protected `PATCH /api/leads/[id]`**

Validate the document ID, strict status body, session, and administrator role before updating.

- [ ] **Step 5: Run API tests**

Run:

```powershell
npx vitest run tests/api
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add app/api/leads tests/api/admin-leads.test.ts
git commit -m "feat: protect lead management APIs"
```

### Task 8: Build login and administrator dashboard

**Files:**
- Create: `app/login/page.tsx`
- Create: `components/auth/login-form.tsx`
- Create: `app/admin/page.tsx`
- Create: `components/admin/admin-dashboard.tsx`
- Create: `tests/components/admin-dashboard.test.tsx`

- [ ] **Step 1: Write failing dashboard tests**

Tests must prove:

```ts
expect(screen.getByText("New")).toBeVisible()
expect(screen.getByText("Contacted")).toBeVisible()
expect(screen.getByText("Closed")).toBeVisible()
await user.type(screen.getByRole("searchbox"), "mousumi")
expect(screen.getByText(/mousumi/i)).toBeVisible()
expect(screen.queryByText(/other lead/i)).not.toBeInTheDocument()
```

Changing status must call the PATCH route and restore the old state when the request fails.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
npx vitest run tests/components/admin-dashboard.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement login**

Use Firebase client authentication with in-memory persistence, exchange the ID token for the server session, sign out the client SDK, and navigate to `/admin`. Do not store credentials.

- [ ] **Step 4: Protect `/admin` on the server**

The page calls `requireAdmin()` before rendering. A 401 redirects to `/login`; a 403 renders an access-denied state.

- [ ] **Step 5: Implement dashboard behavior**

Fetch from protected APIs, compute four summary counts, filter by normalized name or email, render desktop table/mobile cards, update status, and expose loading, empty, no-results, expired-session, and retry states.

- [ ] **Step 6: Run component and complete unit tests**

Run:

```powershell
npm test
npm run lint
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add app/login app/admin components/auth components/admin tests/components
git commit -m "feat: add protected lead dashboard"
```

### Task 9: Provision Firebase and test administrator

**Files:**
- Create: `scripts/provision-admin.mjs`
- Create: `docs/database-setup.md`
- Modify: `package.json`

- [ ] **Step 1: Create setup instructions**

Document exact Firebase Console steps:

1. Create project `leaddesk-mini-mousumi`.
2. Register a web application.
3. Enable Email/Password Authentication.
4. Create the default Firestore database.
5. Create a service account key for local setup only.
6. Add local environment variables.
7. Create one test administrator without committing its password.

- [ ] **Step 2: Implement the provisioning script**

The script accepts `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the process environment, creates or retrieves the Firebase Auth user, and writes:

```js
await db.collection("admins").doc(user.uid).set({
  email: email.toLowerCase(),
  role: "admin",
  createdAt: FieldValue.serverTimestamp(),
}, { merge: true })
```

It must reject weak passwords and never log the password.

- [ ] **Step 3: Run the provisioner against the real project**

Run with process-local environment variables. Expected: administrator UID and success message; no secret printed.

- [ ] **Step 4: Manually exercise local database and authentication**

Expected: lead submission persists, admin login succeeds, and unauthorized access fails.

- [ ] **Step 5: Commit**

```powershell
git add scripts/provision-admin.mjs docs/database-setup.md package.json
git commit -m "docs: add secure Firebase provisioning workflow"
```

### Task 10: Complete documentation and browser verification

**Files:**
- Create: `tests/e2e/leaddesk.spec.ts`
- Create: `playwright.config.ts`
- Create: `README.md`
- Create: `docs/submission-checklist.md`

- [ ] **Step 1: Write the fresh-browser journey**

The Playwright test must:

```ts
await page.goto("/")
await page.getByLabel("Name").fill("Mousumi Test")
await page.getByLabel("Email").fill("mousumi.test@example.com")
await page.getByLabel("Budget range").selectOption("1000-5000")
await page.getByLabel("Project details").fill("I need a responsive Shopify storefront for a clothing brand.")
await page.getByRole("button", { name: /send project request/i }).click()
await expect(page.getByRole("status")).toContainText("received")
```

The authenticated part logs in using test-only environment values, searches the created lead, changes status, reloads, and confirms persistence.

- [ ] **Step 2: Write the README**

Include product purpose, screenshots, features, stack rationale, architecture, data model, auth flow, environment-variable names, setup, commands, deployed URLs, security decisions, limitations, and future improvements. Do not include credential values.

- [ ] **Step 3: Write the PDF evidence checklist**

Create one row for every requirement on pages 9-10 with:

- Requirement
- Implementation evidence
- Manual verification
- Loom timestamp
- Final status

- [ ] **Step 4: Run the complete local verification**

Run:

```powershell
npm run verify
npx playwright install chromium
npm run test:e2e
```

Expected: lint, typecheck, unit tests, production build, and browser tests all pass.

- [ ] **Step 5: Inspect responsive layouts**

Capture and inspect 360px, 768px, and 1440px views. Confirm no clipped text, horizontal overflow, unreadable controls, low-contrast footer, or old watermark.

- [ ] **Step 6: Commit**

```powershell
git add tests/e2e playwright.config.ts README.md docs/submission-checklist.md
git commit -m "test: verify complete LeadDesk Mini journey"
```

### Task 11: Publish and verify the deliverables

**Files:**
- Modify: `README.md`
- Modify: `docs/submission-checklist.md`

- [ ] **Step 1: Create the public GitHub repository**

Repository name: `leaddesk-mini-mousumi-swain`. Confirm no secret or `.env.local` file appears in Git history.

- [ ] **Step 2: Push the verified branch**

Expected: public repository opens without authentication and displays the README.

- [ ] **Step 3: Import the repository into Vercel**

Configure every Firebase environment variable in Vercel, deploy, and copy the production URL.

- [ ] **Step 4: Run production verification in a fresh browser**

Verify:

- Landing page and exact footer.
- Empty and invalid form states.
- Real lead submission.
- Login failure and success.
- Direct `/admin` protection.
- Search.
- New -> Contacted -> Closed updates.
- Refresh persistence.
- Logout protection.
- Mobile and desktop layouts.

- [ ] **Step 5: Update and republish documentation**

Add the final landing-page and `/admin` URLs to README, rerun `npm run verify`, commit, push, and confirm the production deployment updates.

- [ ] **Step 6: Prepare candidate-owned submission materials**

Create the Google Drive folder `FullStackDevelopment_MousumiSwain` with:

- Submission links document.
- Loom link.
- Test credentials document.
- Screenshots.
- AI-usage statement.

Verify "Anyone with the link can view" in incognito mode.

- [ ] **Step 7: Record and check the Loom**

The 2-3 minute recording must show form submission, administrator login, new lead, search, status change, refresh persistence, and the database/auth explanation. Confirm audio, readability, link permissions, and no secret values.

- [ ] **Step 8: Final PDF audit**

Read pages 9-10 again and mark every checklist row complete only when evidence is visible. Do not submit with a broken URL, private repository, private Drive folder, missing Loom, absent footer, or exposed secret.
