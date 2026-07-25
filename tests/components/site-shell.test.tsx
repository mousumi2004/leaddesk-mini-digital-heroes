import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import Home from "@/app/page";
import { Footer } from "@/components/site/footer";

afterEach(cleanup);

describe("public shell semantics", () => {
  it("uses a linked header wordmark and a non-linked footer wordmark", () => {
    const { container } = render(
      <>
        <Home />
        <Footer />
      </>,
    );

    expect(screen.getByRole("link", { name: "LeadDesk Mini" })).toBeVisible();
    expect(
      screen.getByText("LeadDesk Mini", { selector: "span.brand" }),
    ).toBeVisible();
    expect(container.querySelector(".brand-mark")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Built for Digital Heroes Training Task",
      }),
    ).toHaveAttribute("href", "https://digitalheroesco.com");
  });

  it("marks visual step numbers as decorative", () => {
    const { container } = render(<Home />);

    expect(
      container.querySelectorAll(".step-number[aria-hidden='true']"),
    ).toHaveLength(3);
  });
});
