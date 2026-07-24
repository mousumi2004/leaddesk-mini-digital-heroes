import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FormJumpLink } from "@/components/site/form-jump-link";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("FormJumpLink", () => {
  it("links to and focuses the project form heading", async () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    render(
      <>
        <FormJumpLink />
        <h2 id="project-form" tabIndex={-1}>
          Tell us what you&apos;re building.
        </h2>
      </>,
    );

    const user = userEvent.setup();
    const link = screen.getByRole("link", { name: "Share your project" });
    expect(link).toHaveAttribute("href", "#project-form");

    await user.click(link);

    expect(
      screen.getByRole("heading", { name: "Tell us what you're building." }),
    ).toHaveFocus();
  });
});
