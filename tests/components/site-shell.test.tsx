import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import Home from "@/app/page";
import { Footer } from "@/components/site/footer";

afterEach(cleanup);

describe("public shell semantics", () => {
  it("uses visible brand text as the accessible link name", () => {
    render(
      <>
        <Home />
        <Footer />
      </>,
    );

    expect(screen.getAllByRole("link", { name: "LeadDesk Mini" })).toHaveLength(
      2,
    );
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
