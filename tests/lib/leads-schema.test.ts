import { describe, expect, it } from "vitest";

import {
  leadInputSchema,
  normalizeLeadInput,
  statusUpdateSchema,
} from "@/lib/leads/schema";

const validLead = {
  name: "  Mousumi Swain  ",
  email: "  MOUSUMI@EXAMPLE.COM ",
  budget: "1000-5000",
  message: "  I need a responsive Shopify storefront for my clothing brand.  ",
  company: "",
};

describe("leadInputSchema", () => {
  it("accepts the four required lead fields and an empty honeypot", () => {
    expect(leadInputSchema.safeParse(validLead).success).toBe(true);
  });

  it("rejects an invalid email address", () => {
    const result = leadInputSchema.safeParse({
      ...validLead,
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a message shorter than ten characters", () => {
    const result = leadInputSchema.safeParse({
      ...validLead,
      message: "Too short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a budget outside the supported choices", () => {
    const result = leadInputSchema.safeParse({
      ...validLead,
      budget: "unlisted",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a filled honeypot field", () => {
    const result = leadInputSchema.safeParse({
      ...validLead,
      company: "spam bot",
    });

    expect(result.success).toBe(false);
  });

  it("rejects unknown public fields such as status", () => {
    const result = leadInputSchema.safeParse({
      ...validLead,
      status: "closed",
    });

    expect(result.success).toBe(false);
  });
});

describe("normalizeLeadInput", () => {
  it("trims text and lowercases the email", () => {
    expect(normalizeLeadInput(validLead)).toEqual({
      name: "Mousumi Swain",
      email: "mousumi@example.com",
      budget: "1000-5000",
      message: "I need a responsive Shopify storefront for my clothing brand.",
    });
  });
});

describe("statusUpdateSchema", () => {
  it.each(["new", "contacted", "closed"])(
    "accepts the required %s status",
    (status) => {
      expect(statusUpdateSchema.safeParse({ status }).success).toBe(true);
    },
  );

  it("rejects an unsupported status", () => {
    expect(statusUpdateSchema.safeParse({ status: "archived" }).success).toBe(
      false,
    );
  });
});
