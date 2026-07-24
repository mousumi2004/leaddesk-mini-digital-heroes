# LeadDesk Mini — Final Polish Design

Date: 24 July 2026  
Candidate: Mousumi Swain  
Role: Full Stack Development  
Status: Approved by candidate

## 1. Objective

Raise the existing, assignment-complete LeadDesk Mini application from a
strong submission to a more refined and memorable one without expanding beyond
the Full Stack Development brief.

The upgrade will preserve the application’s working architecture, security,
data model, required wording, and core workflow. It will improve visual craft,
administrator efficiency, accessibility, and verification evidence.

## 2. Product Principles

- Keep the public lead form immediately visible because it is Task A’s primary
  interaction.
- Prefer useful workflow improvements over decorative features.
- Preserve the candidate’s original product identity rather than imitating the
  Digital Heroes website or a third-party template.
- Keep submitted customer details read-only; administrators may change only
  lead status.
- Do not weaken authentication, authorization, validation, CSRF protection,
  server-only data access, or secret handling.
- Keep one clear production URL for reviewers.

## 3. Public Experience

### Visual direction

The public page will move closer to the approved polished concept:

- Deep navy background with restrained clear-blue and warm-gold accents.
- More deliberate typography, spacing rhythm, content width, and hierarchy.
- Gold-accented benefit ticks with sufficient contrast.
- A refined form card with clear grouping, readable labels, strong focus
  states, and restrained depth.
- A more visual but still compact three-step workflow.
- No stock imagery, fake customers, testimonials, pricing, chat widgets,
  analytics, or additional navigation.

The implementation will use HTML and CSS rather than inserting the generated
concept image into the product. This keeps text crisp, responsive, accessible,
and editable.

### Lead form interaction

The form remains embedded and visible on desktop and appears naturally after
the introduction on small screens.

Selecting `Share your project` will:

1. Scroll to the form using native in-page navigation.
2. Respect reduced-motion preferences.
3. Move focus to a useful form heading or first field so keyboard and assistive
   technology users receive the same context.
4. Apply a brief, restrained visual emphasis to the form container where this
   can be implemented without distracting animation.

Existing validation, pending, success, and failure behavior remains unchanged
unless a defect is discovered during verification.

### Required footer

The visible footer text remains exactly:

`Built for Digital Heroes Training Task`

It remains linked to:

`https://digitalheroesco.com`

The credit must be readable, visible on all pages, and free from any watermark
or replaced wording.

## 4. Administrator Experience

### Status filters

The lead toolbar will add four filters:

- All
- New
- Contacted
- Closed

The selected filter will be visually clear and programmatically exposed. Search
and status filtering will combine: a lead must satisfy both the current search
query and selected status.

The interface will preserve useful states for:

- No leads in the database.
- No leads matching the selected status.
- No leads matching the combined search and status filter.

Summary cards remain informational; they will not silently replace the explicit
filter controls.

### Complete lead details

Administrators need a reliable way to read the complete submitted project
message. Each lead will provide an accessible expand/collapse control:

- The collapsed state keeps the dashboard scannable.
- The expanded state shows the complete message without editing controls.
- The control exposes its expanded state to assistive technology.
- Expansion remains usable in desktop table and mobile card layouts.

The implementation should use an inline expandable region rather than a modal
or drawer unless the existing layout makes that approach demonstrably
inaccessible.

### Existing workflow

The following behavior remains:

- Authenticated and authorized administrators only.
- Search by name or email.
- Status values limited to New, Contacted, and Closed.
- Optimistic status updates with rollback on failure.
- Refresh and logout.
- Redirect to login when the session is missing or invalid.

No administrator control will edit a customer’s name, email, budget, or
message.

## 5. Accessibility

The implementation will correct the known audit issues:

- Ensure the process eyebrow meets WCAG AA text contrast.
- Ensure decorative step numbers either meet applicable contrast or are hidden
  from accessibility requirements when they do not convey essential content.
- Make the brand link’s accessible name include its visible text.

Additional review will cover:

- Keyboard operation and logical focus order.
- Visible focus indicators.
- Filter state announcements and names.
- Expand/collapse control names and states.
- Form-scroll focus behavior.
- Mobile reflow without horizontal scrolling.
- Reduced-motion behavior.

The target is a Lighthouse accessibility score of 100, while treating manual
keyboard and screen-reader semantics as more important than the numeric score.

## 6. Visual and Functional Boundaries

This upgrade explicitly excludes:

- A popup or modal lead form.
- New database collections or status values.
- Editing or deleting leads.
- Charts, exports, assignment automation, email campaigns, or CRM integrations.
- Multiple administrator roles.
- Netlify-specific code or a second production deployment.
- Copying Digital Heroes branding, colors, typography, layout, or marketing
  copy.

These exclusions keep the result focused, easier to explain in the interview,
and safer to finish before the deadline.

## 7. Deployment Decision

Vercel remains the primary and only submitted host.

The current production alias is:

`https://leaddesk-mini-digital-heroes.vercel.app`

Vercel’s Hobby retention policy may remove eligible older deployments after
30 days, but aliased deployments are preserved. The production alias has no
scheduled 30-day expiry. Availability still depends on the account remaining
active, compliance with Hobby-plan rules, and staying within free usage limits.

Netlify is not added now because it would duplicate secrets and deployment
verification while introducing another platform-specific failure surface. The
public GitHub repository and reproducible deployment configuration provide the
recovery path if redeployment becomes necessary.

## 8. Verification

### Automated

- Add component tests for status filtering.
- Add component tests for combined search and status filtering.
- Add component tests for expanded and collapsed lead details.
- Add or update interaction tests for the public form jump/focus behavior.
- Preserve all existing validation, API, authentication, authorization, and
  status-update tests.
- Run ESLint, TypeScript checking, the complete Vitest suite, and a production
  Next.js build.
- Run Playwright against the production deployment for public submission,
  route protection, administrator login, lead search/filtering, lead-detail
  expansion, status persistence, refresh, and logout.

### Visual and manual

- Compare desktop and mobile screenshots with the approved visual direction.
- Check public, login, administrator, loading, empty, error, and filtered-empty
  states.
- Verify keyboard navigation, focus visibility, reduced motion, accessible
  names, contrast, and responsive reflow.
- Run Lighthouse on mobile and desktop.
- Confirm the exact footer text and destination on every page.
- Confirm the production URL returns successfully in a fresh private browser.
- Confirm no secret, test credential, generated report, or private key appears
  in the public repository.

## 9. Data Cleanup

Automated production verification can create clearly labelled test leads.
Before submission, those records may be removed only after:

1. Listing the exact candidate records.
2. Separating automated verification records from Mousumi’s real manual lead.
3. Receiving explicit deletion approval if any record is ambiguous.

No bulk or pattern-based destructive operation will run against an unresolved
set of records.

## 10. Submission Timing

Target submission time: no later than 12:00 noon IST on 25 July 2026.

Before submission:

1. Finish production verification.
2. Let Mousumi manually inspect the public and administrator workflows.
3. Record the Loom walkthrough in Mousumi’s own voice.
4. Prepare the Google Drive folder named
   `FullStackDevelopment_MousumiSwain`.
5. Verify that Drive sharing is `Anyone with the link can view` from an
   incognito browser.
6. Send the single Drive folder link using the submission channel stated in
   the assignment.

