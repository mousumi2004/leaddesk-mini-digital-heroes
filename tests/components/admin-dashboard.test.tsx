import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type { LeadRecord } from "@/lib/leads/schema";

const leads: LeadRecord[] = [
  {
    id: "lead-1",
    name: "Mousumi Swain",
    email: "mousumi@example.com",
    budget: "1000-5000",
    message: "I need a responsive Shopify storefront for my clothing brand.",
    status: "new",
    createdAt: "2026-07-24T10:00:00.000Z",
    updatedAt: "2026-07-24T10:00:00.000Z",
  },
  {
    id: "lead-2",
    name: "Aarav Patel",
    email: "aarav@example.com",
    budget: "5000-10000",
    message: "We need a website redesign for our professional services firm.",
    status: "contacted",
    createdAt: "2026-07-23T10:00:00.000Z",
    updatedAt: "2026-07-24T09:00:00.000Z",
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockInitialLeads() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ leads }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ),
  );
}

describe("AdminDashboard", () => {
  it("shows all status summary cards and lead data", async () => {
    mockInitialLeads();
    render(<AdminDashboard adminEmail="admin@example.com" />);

    expect(await screen.findByText("Mousumi Swain")).toBeVisible();
    expect(screen.getByText("Aarav Patel")).toBeVisible();
    expect(screen.getByTestId("count-total")).toHaveTextContent("2");
    expect(screen.getByTestId("count-new")).toHaveTextContent("1");
    expect(screen.getByTestId("count-contacted")).toHaveTextContent("1");
    expect(screen.getByTestId("count-closed")).toHaveTextContent("0");
  });

  it("searches leads by name or email", async () => {
    mockInitialLeads();
    render(<AdminDashboard adminEmail="admin@example.com" />);
    const user = userEvent.setup();
    await screen.findByText("Mousumi Swain");

    await user.type(screen.getByRole("searchbox"), "mousumi");

    expect(screen.getByText("Mousumi Swain")).toBeVisible();
    expect(screen.queryByText("Aarav Patel")).not.toBeInTheDocument();
  });

  it("saves a permitted status change", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ leads }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Lead status updated." }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<AdminDashboard adminEmail="admin@example.com" />);
    const user = userEvent.setup();

    const status = await screen.findByLabelText("Status for Mousumi Swain");
    await user.selectOptions(status, "closed");

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/leads/lead-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "closed" }),
        }),
      ),
    );
    expect(status).toHaveValue("closed");
  });

  it("restores the previous status if saving fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ leads }), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: "Unable to update." }), {
            status: 500,
            headers: { "content-type": "application/json" },
          }),
        ),
    );
    render(<AdminDashboard adminEmail="admin@example.com" />);
    const user = userEvent.setup();

    const status = await screen.findByLabelText("Status for Mousumi Swain");
    await user.selectOptions(status, "closed");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to update.",
    );
    expect(status).toHaveValue("new");
  });
});
