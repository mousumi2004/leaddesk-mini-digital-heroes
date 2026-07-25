# LeadDesk Mini Green Refinement Design

**Date:** 25 July 2026  
**Status:** Approved for implementation  
**Scope:** Visual refinement, lead-detail interaction, and six existing lead briefs

## Intent

Refine LeadDesk Mini into a cleaner, more polished small-agency CRM while preserving its existing product structure, authentication, validation, database model, and deployment. The result must feel original to LeadDesk Mini.

Digital Heroes influences only the colour palette. The layout, typography treatment, components, animation patterns, copy, and interaction design will not reproduce the Digital Heroes website.

## Visual System

Use a restrained 70/30 balance:

- Approximately 70% warm off-white and pale neutral surfaces.
- Approximately 30% green accents, dark green navigation, and emphasis.
- Primary sage green: `#6fa37a`.
- Deep green: `#3f6b54`.
- Pale sage: `#a1c4ab`.
- Existing semantic status colours remain distinct and accessible.

Apply the palette consistently to the public landing page, administrator login, administrator dashboard, navigation, controls, forms, cards, and footer.

LeadDesk Mini becomes a text-only wordmark. Remove the circular “L” mark from every header and footer. Use a confident display treatment based on the existing font system, with deliberate weight, tracking, and spacing rather than introducing an unnecessary logo asset.

In the footer, “LeadDesk Mini” is plain text and performs no navigation. The required credit remains visible with the exact wording “Built for Digital Heroes Training Task” and continues to link to `https://digitalheroesco.com`.

## Original Motion Language

Motion must support clarity and remain independent from the Digital Heroes implementation:

- A low-contrast dotted grid built with CSS gradients.
- One or two soft green background glows with slow, small-position movement.
- Cards and primary controls lift by no more than two pixels on hover.
- Buttons use short colour and shadow transitions.
- The detail pane enters with a short fade and horizontal movement.
- No copied animation sequence, orbit, marquee, scroll choreography, or page composition.
- No animation library is required.
- `prefers-reduced-motion: reduce` disables non-essential movement.

## Administrator Lead Overview

Keep the current summary cards, search, filters, refresh control, status selector, lead counts, and responsive table.

Replace inline brief expansion with one selected-lead detail pane:

- Every row has a stable “View full brief” button.
- Selecting it opens a large right-side pane over the dashboard.
- The dashboard remains visible behind a dimmed, lightly blurred backdrop.
- The pane displays the lead name, email, budget, received date, current status, and complete project brief.
- The pane has its own vertical scrolling for long content.
- A clearly labelled close button is always available.
- Escape closes the pane.
- Clicking the backdrop closes the pane.
- Focus moves into the pane when it opens and returns to the triggering button when it closes.
- The mobile version occupies nearly the full viewport width while preserving safe spacing.

The pane reads the selected lead already loaded in the dashboard. It does not make another database request.

## Existing Lead Briefs

Update only the `message` field of the six existing Firestore lead records.

Preserve each record’s:

- Document ID
- Name
- Email
- Budget
- Status
- Creation date
- Any other existing metadata

Each revised message will expand the original request into a realistic client brief while preserving its original project type and intent. The writing should include useful context such as the business goal, required pages or features, audience, operational needs, preferred outcome, and relevant constraints. Do not invent sensitive personal information, contractual commitments, or guaranteed results.

The six records must be read and matched individually before any write. After updating, read them back to confirm that only the intended message values changed.

## Authentication and Navigation

Authentication, session-cookie handling, route protection, login behaviour, and logout behaviour remain unchanged.

Removing the footer homepage link is a navigation refinement only. Logout continues to use the existing authenticated session endpoint and redirect to `/login`.

## Error Handling

- Existing dashboard loading and API errors remain visible.
- Closing the detail pane does not alter lead state.
- A failed status update continues to roll back optimistically changed UI state.
- Database brief updates stop and report the exact failed record if any write fails.
- No production lead is deleted or recreated.

## Verification

Implementation will follow tests-first changes for:

- Text-only brand treatment and non-linked footer wordmark.
- Required Digital Heroes credit and link.
- Opening the correct lead in the detail pane.
- Displaying all lead fields in the pane.
- Closing with the close button, backdrop, and Escape.
- Focus behaviour and accessible dialog naming.
- Existing search, filters, status updates, authentication, validation, and responsive behaviour.

Run linting, type checking, automated tests, production build, and browser verification. Verify the deployed landing page, login, dashboard, modal, status persistence, footer credit, mobile layout, and reduced-motion behaviour before handing off the live URL.

## Non-goals

- No recreation of the Digital Heroes layout or animation system.
- No new CRM modules, analytics, messaging, deletion, editing, pagination, or role management.
- No database migration.
- No change to authentication credentials.
- No change to the required footer-credit wording or destination.
