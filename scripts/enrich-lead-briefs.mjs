import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const enrichedBriefs = {
  aiTravel:
    "I want to build an AI-powered travel planning application for people who find trip research overwhelming. A user should be able to enter their destination, travel dates, budget, interests, preferred pace, and who they are travelling with. The product should return a practical day-by-day itinerary with suggested attractions, travel time between stops, estimated daily costs, food recommendations, and alternatives for bad weather. Users should be able to edit the plan, save favourite places, and share the final itinerary. The interface must be mobile-first, simple for first-time users, and transparent that recommendations are AI-assisted. For the first release, I would like a polished planner flow, saved trips, and a lightweight administrator view for monitoring usage and feedback.",
  antiImpulse:
    'I need a responsive "de-influence" dashboard and anti-impulse shopping companion that helps users pause before purchasing products they discover online. Users should be able to save a product, record its price and reason for wanting it, start a cooling-off timer, compare it with items they already own, and review the longer-term cost. The dashboard should show avoided purchases, money saved, active waiting periods, and personal shopping patterns without making the experience judgmental. I also want prompts that encourage users to consider durability, realistic usage, and cheaper alternatives. The visual direction should feel calm and trustworthy rather than like another shopping platform. The first version should include onboarding, saved items, decision reminders, simple insights, and a mobile-friendly experience.',
  gymCampaign:
    "We need a high-conversion campaign website for a gym launching a new membership drive. The page should clearly explain the gym’s training options, facilities, trainer support, class schedule, membership plans, and limited-time joining offer. Visitors should be able to request a trial session or membership consultation through a short form, with enquiries routed to the gym team for follow-up. The campaign should include strong mobile layouts, authentic transformation stories, trainer profiles, frequently asked questions, location details, and prominent calls to action without feeling aggressive. We also need basic analytics-ready structure so the team can understand which campaign sections generate enquiries. The finished site should load quickly, remain accessible, and be easy to update for future seasonal offers.",
  careerPlatform:
    "I want to build a career platform for students and fresh graduates who struggle to find relevant early-career opportunities. Users should be able to create a skills-based profile, discover internships and entry-level roles, save opportunities, track each application stage, and receive deadline reminders. Recommendations should consider skills, interests, preferred work mode, location, and experience level while still allowing users to browse freely. The administrator area should support posting and editing opportunities, reviewing engagement, and identifying expired listings. The platform must be responsive, accessible, fast on low-cost mobile devices, and clear enough for first-time job seekers. For the initial release, I would like profile onboarding, opportunity discovery, saved roles, application tracking, reminders, and a focused administrator dashboard.",
  shopifyLaunch:
    "I need a Shopify store for a growing product brand that is ready to begin selling online. The store should include a polished homepage, collection and product pages, search, cart, checkout setup, customer policies, contact information, and essential trust content. Product pages need clear imagery, variants, pricing, delivery information, and space for customer reviews. I also want the store organised so the team can add products and update banners without developer support. The design should feel distinctive to the brand, work smoothly on mobile, and keep the path to purchase simple. Please include payment and shipping configuration, basic analytics, SEO-ready page structure, and launch testing across common devices. The first phase should focus on a reliable, professional storefront rather than unnecessary custom features.",
  shopifyRedesign:
    "I want to rebuild an existing Shopify storefront that currently feels generic and is difficult to browse on mobile. The redesign should improve the homepage hierarchy, collection navigation, product discovery, product-page clarity, and the cart experience while preserving the existing catalogue and customer-facing policies. We need flexible promotional sections, stronger product imagery, variant and delivery information, reviews, related products, and clearer calls to action. The new theme should be easy for the internal team to maintain through Shopify’s editor, with reusable sections instead of hardcoded page content. Please also review responsive behaviour, page speed, basic SEO structure, analytics continuity, and checkout handoff before launch. The goal is a cleaner branded experience that increases confidence without adding distracting effects or unnecessary applications.",
};

export function classifyBrief(message) {
  const value = message.trim().toLowerCase();
  const alreadyEnriched = Object.entries(enrichedBriefs).find(
    ([, brief]) => brief.toLowerCase() === value,
  );
  if (alreadyEnriched) return alreadyEnriched[0];
  if (value.includes("travel")) return "aiTravel";
  if (
    value.includes("impulse") ||
    value.includes("de-influence") ||
    value.includes("shopping companion")
  ) {
    return "antiImpulse";
  }
  if (value.includes("gym")) return "gymCampaign";
  if (
    value.includes("career") ||
    value.includes("student") ||
    value.includes("graduate")
  ) {
    return "careerPlatform";
  }
  if (value.includes("shopify") && value.includes("build for me")) {
    return "shopifyRedesign";
  }
  if (value.includes("shopify")) return "shopifyLaunch";
  throw new Error("A lead brief could not be classified safely.");
}

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function comparable(value) {
  if (value && typeof value.toMillis === "function") {
    return { __timestamp: value.toMillis() };
  }
  if (Array.isArray(value)) return value.map(comparable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== "message")
        .map(([key, nested]) => [key, comparable(nested)]),
    );
  }
  return value;
}

export async function enrichLeadBriefs({ apply = false } = {}) {
  for (const [kind, brief] of Object.entries(enrichedBriefs)) {
    if (brief.length > 1000) {
      throw new Error(`${kind} exceeds the 1,000-character schema limit.`);
    }
  }

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: required("FIREBASE_ADMIN_PROJECT_ID"),
        clientEmail: required("FIREBASE_ADMIN_CLIENT_EMAIL"),
        privateKey: required("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n"),
      }),
    });
  const db = getFirestore(app);
  const beforeSnapshot = await db.collection("leads").get();

  if (beforeSnapshot.size !== 6) {
    throw new Error(
      `Expected exactly 6 leads, found ${beforeSnapshot.size}; no changes made.`,
    );
  }

  const assignments = beforeSnapshot.docs.map((document) => ({
    document,
    kind: classifyBrief(document.get("message") ?? ""),
  }));
  const categories = assignments.map(({ kind }) => kind).sort();
  const expected = Object.keys(enrichedBriefs).sort();
  if (JSON.stringify(categories) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected one lead per project type; found ${categories.join(", ")}. No changes made.`,
    );
  }

  if (!apply) {
    return { applied: false, count: assignments.length, categories };
  }

  const backupDirectory = resolve(process.cwd(), "tmp");
  await mkdir(backupDirectory, { recursive: true });
  const backupPath = resolve(
    backupDirectory,
    `lead-brief-backup-${new Date().toISOString().replaceAll(":", "-")}.json`,
  );
  await writeFile(
    backupPath,
    JSON.stringify(
      beforeSnapshot.docs.map((document) => ({
        id: document.id,
        data: comparable(document.data()),
        message: document.get("message"),
      })),
      null,
      2,
    ),
    "utf8",
  );

  const batch = db.batch();
  for (const { document, kind } of assignments) {
    batch.update(document.ref, { message: enrichedBriefs[kind] });
  }
  await batch.commit();

  const afterSnapshot = await db.collection("leads").get();
  const afterById = new Map(
    afterSnapshot.docs.map((document) => [document.id, document]),
  );
  for (const { document, kind } of assignments) {
    const after = afterById.get(document.id);
    if (!after) throw new Error("A lead disappeared during verification.");
    if (
      JSON.stringify(comparable(document.data())) !==
      JSON.stringify(comparable(after.data()))
    ) {
      throw new Error(`Non-message fields changed for lead ${document.id}.`);
    }
    if (after.get("message") !== enrichedBriefs[kind]) {
      throw new Error(`Message verification failed for lead ${document.id}.`);
    }
  }

  return {
    applied: true,
    count: assignments.length,
    categories,
    backupPath,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await enrichLeadBriefs({
    apply: process.argv.includes("--apply"),
  });
  console.log(
    result.applied
      ? `Updated and verified ${result.count} lead briefs. Backup: ${result.backupPath}`
      : `Dry run passed for ${result.count} lead briefs: ${result.categories.join(", ")}`,
  );
}
