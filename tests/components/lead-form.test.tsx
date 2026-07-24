import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LeadForm } from "@/components/lead/lead-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function completeValidForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Name"), "Mousumi Swain");
  await user.type(screen.getByLabelText("Email"), "mousumi@example.com");
  await user.selectOptions(
    screen.getByLabelText("Budget range"),
    "1000-5000",
  );
  await user.type(
    screen.getByLabelText("Project details"),
    "I need a responsive Shopify storefront for my clothing brand.",
  );
  return user;
}

describe("LeadForm", () => {
  it("renders all four PDF-required fields as required", () => {
    render(<LeadForm />);

    expect(screen.getByLabelText("Name")).toBeRequired();
    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText("Budget range")).toBeRequired();
    expect(screen.getByLabelText("Project details")).toBeRequired();
  });

  it("shows a clear client-side email error", async () => {
    render(<LeadForm />);
    const user = await completeValidForm();
    const email = screen.getByLabelText("Email");
    await user.clear(email);
    await user.type(email, "invalid-email");

    await user.click(
      screen.getByRole("button", { name: "Send project request" }),
    );

    expect(await screen.findByText("Enter a valid email address.")).toBeVisible();
  });

  it("submits valid data and clears the form after success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Thanks - your project request has been received.",
        }),
        { status: 201, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<LeadForm />);
    const user = await completeValidForm();

    await user.click(
      screen.getByRole("button", { name: "Send project request" }),
    );

    expect(
      await screen.findByText(
        "Thanks - your project request has been received.",
      ),
    ).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/leads",
      expect.objectContaining({ method: "POST" }),
    );
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });

  it("preserves entered values when the server fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: "Unable to save your request right now." }),
          { status: 500, headers: { "content-type": "application/json" } },
        ),
      ),
    );
    render(<LeadForm />);
    const user = await completeValidForm();

    await user.click(
      screen.getByRole("button", { name: "Send project request" }),
    );

    expect(
      await screen.findByText("Unable to save your request right now."),
    ).toBeVisible();
    expect(screen.getByLabelText("Name")).toHaveValue("Mousumi Swain");
  });
});
