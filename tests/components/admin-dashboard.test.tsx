import { render, screen, waitFor, within } from "@testing-library/react";
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
  {
    id: "lead-3",
    name: "Nisha Rao",
    email: "nisha@example.com",
    budget: "10000-plus",
    message:
      "We need a multi-market e-commerce platform for our homeware brand.",
    status: "closed",
    createdAt: "2026-07-22T10:00:00.000Z",
    updatedAt: "2026-07-24T08:00:00.000Z",
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
    expect(screen.getByTestId("count-total")).toHaveTextContent("3");
    expect(screen.getByTestId("count-new")).toHaveTextContent("1");
    expect(screen.getByTestId("count-contacted")).toHaveTextContent("1");
    expect(screen.getByTestId("count-closed")).toHaveTextContent("1");
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

  it("filters leads by status", async () => {
    mockInitialLeads();
    render(<AdminDashboard adminEmail="admin@example.com" />);
    const user = userEvent.setup();
    await screen.findByText("Mousumi Swain");

    await user.click(
      screen.getByRole("button", { name: "Closed" }),
    );

    expect(screen.getByText("Nisha Rao")).toBeVisible();
    expect(screen.queryByText("Mousumi Swain")).not.toBeInTheDocument();
    expect(screen.queryByText("Aarav Patel")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Closed" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("combines status filtering with search", async () => {
    mockInitialLeads();
    render(<AdminDashboard adminEmail="admin@example.com" />);
    const user = userEvent.setup();
    await screen.findByText("Mousumi Swain");

    await user.click(
      screen.getByRole("button", { name: "Contacted" }),
    );
    await user.type(screen.getByRole("searchbox"), "mousumi");

    expect(screen.getByText("No matching leads")).toBeVisible();
    expect(
      screen.getByText(
        "Change the status filter or search term and try again.",
      ),
    ).toBeVisible();
  });

  it("opens the selected lead in a complete project brief dialog", async () => {
    mockInitialLeads();
    render(<AdminDashboard adminEmail="admin@example.com" />);
    const user = userEvent.setup();
    await screen.findByText("Mousumi Swain");

    await user.click(screen.getByRole("button", {
      name: "View full brief from Mousumi Swain",
    }));

    const dialog = screen.getByRole("dialog", {
      name: "Project brief from Mousumi Swain",
    });
    expect(dialog).toBeVisible();
    expect(within(dialog).getByText("mousumi@example.com")).toBeVisible();
    expect(within(dialog).getByText("$1,000 - $5,000")).toBeVisible();
    expect(within(dialog).getByText("New")).toBeVisible();
    expect(dialog).toHaveTextContent(
      "I need a responsive Shopify storefront for my clothing brand.",
    );
  });

  it("closes the project brief and restores focus to its trigger", async () => {
    mockInitialLeads();
    render(<AdminDashboard adminEmail="admin@example.com" />);
    const user = userEvent.setup();
    await screen.findByText("Mousumi Swain");

    const trigger = screen.getByRole("button", {
      name: "View full brief from Mousumi Swain",
    });
    await user.click(trigger);
    await user.click(
      screen.getByRole("button", { name: "Close project brief" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("closes the project brief with Escape", async () => {
    mockInitialLeads();
    render(<AdminDashboard adminEmail="admin@example.com" />);
    const user = userEvent.setup();
    await screen.findByText("Mousumi Swain");

    await user.click(
      screen.getByRole("button", {
        name: "View full brief from Mousumi Swain",
      }),
    );
    expect(screen.getByRole("dialog")).toBeVisible();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the project brief from the blurred backdrop", async () => {
    mockInitialLeads();
    render(<AdminDashboard adminEmail="admin@example.com" />);
    const user = userEvent.setup();
    await screen.findByText("Mousumi Swain");

    await user.click(
      screen.getByRole("button", {
        name: "View full brief from Mousumi Swain",
      }),
    );
    await user.click(screen.getByTestId("lead-dialog-backdrop"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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
