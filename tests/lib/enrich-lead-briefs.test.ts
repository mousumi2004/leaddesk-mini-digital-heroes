import { describe, expect, it } from "vitest";

import {
  classifyBrief,
  enrichedBriefs,
} from "../../scripts/enrich-lead-briefs.mjs";

describe("lead brief enrichment", () => {
  it.each([
    ["Ai Travel Planner App", "aiTravel"],
    ["Anti impulse shopping dashboard", "antiImpulse"],
    ["New gym membership campaign", "gymCampaign"],
    ["Student career opportunity platform", "careerPlatform"],
    ["shopify store", "shopifyLaunch"],
    ["shopify store build for me", "shopifyRedesign"],
  ])("classifies %s", (message, category) => {
    expect(classifyBrief(message)).toBe(category);
  });

  it("keeps every enriched brief within the server schema limit", () => {
    expect(Object.values(enrichedBriefs)).toHaveLength(6);
    for (const brief of Object.values(enrichedBriefs)) {
      expect(brief.length).toBeLessThanOrEqual(1000);
      expect(brief.split(/\s+/).length).toBeGreaterThanOrEqual(100);
      expect(brief.split(/\s+/).length).toBeLessThanOrEqual(180);
    }
  });
});
