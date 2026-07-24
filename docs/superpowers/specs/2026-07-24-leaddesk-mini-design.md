# LeadDesk Mini - Product and Technical Design

Date: 24 July 2026  
Candidate: Mousumi Swain  
Role: Full Stack Development  
Assignment source: Digital Heroes Internship Qualification Task Kit, pages 9-10

## 1. Objective

Build and deploy a small lead-capture product named LeadDesk Mini. The product has:

- A public landing page containing a validated lead form.
- A protected administrator area at `/admin`.
- A real database that persists lead submissions and status changes.
- Real email-and-password authentication with server-managed sessions.
- A public GitHub repository, deployed URLs, documentation, test credentials, and a Loom walkthrough.

The project will prioritize end-to-end completeness, backend quality, reliable authentication, clear validation, and a polished but original responsive interface.

## 2. Requirement Classification

### Compulsory PDF requirements

- Public form fields: name, email, budget range, and message.
- Client-side and server-side validation.
- Persistent storage in a real database.
- `/admin` lead list.
- Lead search.
- Status values: New, Contacted, and Closed.
- Real administrator login using properly handled sessions or tokens.
- Free-tier deployment verified in a fresh browser.
- README explaining the data model and authentication approach.
- Loom showing the journey from form submission to status change.
- Public GitHub repository.
- Deployed URLs and test credentials.
- Visible footer text `Built for Digital Heroes Training Task` linked to `https://digitalheroesco.com`.
- A short AI-usage paragraph explaining where AI was used and what the candidate changed afterward.

### Technical choices made for this implementation

- Next.js with TypeScript for the frontend and backend route handlers.
- Firebase Authentication for real email-and-password login.
- Cloud Firestore for persistent lead and administrator data.
- Firebase Admin SDK for trusted server-side database and authentication operations.
- Vercel Hobby hosting for the deployed Next.js application.
- Zod schemas shared between the form and backend for consistent validation rules.
- Automated unit and browser-flow tests in addition to manual fresh-browser verification.

These technologies are implementation choices, not technologies mandated by the PDF.

## 3. Visual Direction

The interface will be original rather than a copy of the Digital Heroes website.

- Product name: LeadDesk Mini.
- Style: calm, professional, approachable B2B software.
- Colors: deep navy foundation, white and soft neutral surfaces, clear blue primary actions, and restrained amber accents.
- Typography: a readable sans-serif family with a deliberate type scale.
- Layout: strong spacing, clear labels, visible focus states, and responsive behavior at phone, tablet, and desktop sizes.
- Accessibility: semantic landmarks, associated form labels, keyboard operation, visible focus indicators, sufficient contrast, and useful error announcements.

The required Digital Heroes credit will appear in the global footer. Its wording and link will be exact; its styling will match LeadDesk Mini and remain clearly readable.

## 4. Pages and User Experience

### `/` - Public landing page

The page contains a concise product introduction beside or above the lead form. The form contains:

- Name: required, 2-80 characters.
- Email: required, normalized and validated as an email address.
- Budget range: required and selected from fixed options.
- Message: required, 10-1,000 characters.
- A hidden honeypot field to reject simple automated spam.

The submit button shows progress and cannot be repeatedly submitted while a request is in flight. Validation messages appear beside the relevant fields. On success, the form clears and shows a confirmation. Network or server failures show a specific, non-destructive error without losing the entered information.

### `/login` - Administrator login

The page accepts an administrator email and password. Firebase Authentication verifies the credentials. A recent Firebase ID token is exchanged by the server for a secure HTTP-only session cookie. The browser does not persist a reusable Firebase client session.

Invalid credentials show a generic message that does not reveal whether an email account exists. Successful login redirects to `/admin`.

### `/admin` - Protected dashboard

Every dashboard request verifies the session cookie on the server and checks that the authenticated user has a corresponding document in the `admins` collection. A logged-in Firebase user without an administrator record is denied.

The dashboard includes:

- Summary counts for New, Contacted, Closed, and total leads.
- Search by lead name or email.
- A responsive lead list.
- Name, email, budget, message preview, status, and submission time.
- A status control limited to New, Contacted, and Closed.
- Persistent status updates with pending, success, and failure feedback.
- Empty state when no leads exist.
- No-results state when a search has no matches.
- Logout action that clears the server session.

Desktop uses a readable table. Narrow screens use stacked cards so no essential information depends on horizontal scrolling.

## 5. Data Model

### `leads` collection

Each lead document contains:

- `name`: string
- `email`: normalized lowercase string
- `budget`: one allowed budget-range value
- `message`: string
- `status`: `new`, `contacted`, or `closed`
- `createdAt`: server-generated timestamp
- `updatedAt`: server-generated timestamp

Firestore generates the document ID. New leads always receive `new` on the server; the public request cannot choose its own status.

### `admins` collection

Each document ID equals the Firebase Authentication user UID and contains:

- `email`: normalized administrator email
- `role`: `admin`
- `createdAt`: timestamp

Authentication proves identity. The `admins` document provides authorization. This separation prevents every authenticated Firebase user from receiving administrator access.

## 6. Backend and Security

### Lead creation

`POST /api/leads` will:

1. Parse JSON safely.
2. Validate the honeypot and every submitted value on the server.
3. Discard unknown fields.
4. Normalize safe values.
5. Assign the initial status and timestamps on the server.
6. Write the lead through the Firebase Admin SDK.
7. Return a minimal success response without exposing database internals.

### Login session

`POST /api/auth/session` will:

1. Validate the request origin and CSRF value.
2. Verify the supplied Firebase ID token.
3. Require a recent login.
4. Confirm membership in the `admins` collection.
5. Create a short-lived, secure, HTTP-only, same-site session cookie.

### Protected operations

The lead-list and status-update operations will verify the session and administrator authorization on the server. Status updates will validate both the document ID and target status. The client cannot directly access Firestore credentials or perform privileged database operations.

Secrets will be stored only in local and deployment environment variables. `.env*` files, service-account credentials, passwords, and connection secrets will not be committed.

## 7. Error Handling

- Malformed request: HTTP 400 with safe validation details.
- Invalid login: HTTP 401 with a generic message.
- Authenticated but not an administrator: HTTP 403.
- Missing lead: HTTP 404.
- Unexpected database or server failure: HTTP 500 with a user-safe message and server-side diagnostic logging.
- Expired session: clear or reject the session and return the user to `/login`.
- Failed status update: restore the previous visible state and explain that the change was not saved.

No expected error should crash the application or expose secrets, stack traces, Firebase internals, or private configuration.

## 8. Verification Strategy

### Automated checks

- Formatting and linting.
- TypeScript type checking.
- Production build.
- Unit tests for shared validation and status rules.
- API tests for valid and invalid lead submissions.
- Authentication and authorization tests where practical.
- Browser tests for the public form, login protection, lead search, and status changes.

### Manual checks

- Public form success and every validation state.
- Duplicate clicks and slow-request behavior.
- Correct and incorrect administrator credentials.
- Direct unauthenticated access to `/admin`.
- Authenticated non-administrator denial.
- Lead appearance after submission.
- Search by name and email.
- All three status transitions and persistence after refresh.
- Logout and subsequent route protection.
- Phone, tablet, and desktop layouts.
- Keyboard navigation, focus visibility, labels, contrast, and readable errors.
- Exact footer wording, correct destination, visual contrast, and absence of any old watermark.
- Live deployment from a fresh private/incognito browser.
- GitHub repository contains no secret values.

The final requirement audit will map every page 9-10 instruction to visible evidence, a repository location, or a live demonstration step.

## 9. Documentation and Submission

The README will contain:

- Product overview and feature list.
- Screenshots.
- Technology list with reasons.
- Architecture and request flow.
- Firestore data model.
- Authentication and authorization design.
- Local setup and environment-variable names without values.
- Test and production-build commands.
- Live landing-page and administrator URLs.
- Known limitations and future improvements.

The Google Drive folder will be named `FullStackDevelopment_MousumiSwain` and contain a submission-links document, Loom link, test credentials, screenshots, and AI-usage statement. The folder will be set to "Anyone with the link can view" and checked from an incognito browser before the single folder link is sent through Instagram.

The Loom will show public submission, validation, administrator login, lead appearance, search, status change, refresh persistence, and a short explanation of the database and session design.

## 10. Candidate Access Required

Mousumi will personally:

- Create or sign in to GitHub, Firebase, Vercel, Loom, Google Drive, and Instagram when requested.
- Keep passwords and recovery information private.
- Create the administrator account under guided instructions.
- Record the Loom in her own voice using the provided script.
- Review the working application and learn the documented design decisions.
- Follow the required Instagram account and send the final Google Drive link.

No account password will be requested or placed in source code.

