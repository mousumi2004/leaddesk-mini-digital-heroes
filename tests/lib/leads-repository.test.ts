import { describe, expect, it, vi } from "vitest";

import { createLeadRepository, type LeadStore } from "@/lib/leads/repository";

const input = {
  name: "Mousumi Swain",
  email: "mousumi@example.com",
  budget: "1000-5000" as const,
  message: "I need a responsive Shopify storefront for my clothing brand.",
};

function makeStore(): LeadStore {
  return {
    add: vi.fn().mockResolvedValue({ id: "lead-1" }),
    list: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue(undefined),
  };
}

describe("lead repository", () => {
  it("assigns new status and server timestamps when creating a lead", async () => {
    const store = makeStore();
    const repository = createLeadRepository(store);

    await expect(repository.create(input)).resolves.toEqual({ id: "lead-1" });
    expect(store.add).toHaveBeenCalledWith({
      ...input,
      status: "new",
      createdAt: "SERVER_TIMESTAMP",
      updatedAt: "SERVER_TIMESTAMP",
    });
  });

  it("returns records from the store", async () => {
    const store = makeStore();
    vi.mocked(store.list).mockResolvedValue([
      {
        id: "lead-1",
        ...input,
        status: "new",
        createdAt: "2026-07-24T10:00:00.000Z",
        updatedAt: "2026-07-24T10:00:00.000Z",
      },
    ]);
    const repository = createLeadRepository(store);

    await expect(repository.list()).resolves.toHaveLength(1);
  });

  it("updates only status and the server-controlled updated time", async () => {
    const store = makeStore();
    const repository = createLeadRepository(store);

    await repository.updateStatus("lead-1", "contacted");

    expect(store.update).toHaveBeenCalledWith("lead-1", {
      status: "contacted",
      updatedAt: "SERVER_TIMESTAMP",
    });
  });
});
