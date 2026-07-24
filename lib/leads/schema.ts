import { z } from "zod";

export const budgetValues = [
  "under-1000",
  "1000-5000",
  "5000-10000",
  "10000-plus",
] as const;

export const budgetLabels: Record<(typeof budgetValues)[number], string> = {
  "under-1000": "Under $1,000",
  "1000-5000": "$1,000 - $5,000",
  "5000-10000": "$5,000 - $10,000",
  "10000-plus": "$10,000+",
};

export const leadStatuses = ["new", "contacted", "closed"] as const;

export const statusLabels: Record<(typeof leadStatuses)[number], string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

export const leadInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter at least 2 characters.")
      .max(80, "Keep the name under 80 characters."),
    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .max(254, "Keep the email under 254 characters."),
    budget: z.enum(budgetValues, {
      error: "Choose a budget range.",
    }),
    message: z
      .string()
      .trim()
      .min(10, "Tell us a little more about the project.")
      .max(1000, "Keep the message under 1,000 characters."),
    company: z.string().max(0, "Automated submission rejected.").optional(),
  })
  .strict();

export const statusUpdateSchema = z
  .object({
    status: z.enum(leadStatuses),
  })
  .strict();

export type LeadInput = z.infer<typeof leadInputSchema>;
export type LeadStatus = (typeof leadStatuses)[number];
export type BudgetValue = (typeof budgetValues)[number];

export type NormalizedLeadInput = Omit<LeadInput, "company">;

export type LeadRecord = NormalizedLeadInput & {
  id: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};

export function normalizeLeadInput(input: LeadInput): NormalizedLeadInput {
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    budget: input.budget,
    message: input.message.trim(),
  };
}
