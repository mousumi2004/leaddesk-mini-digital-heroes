"use client";

import { ArrowDown } from "lucide-react";

export function FormJumpLink() {
  function focusFormHeading() {
    window.requestAnimationFrame(() => {
      document.getElementById("project-form")?.focus({ preventScroll: true });
    });
  }

  return (
    <a
      className="text-link"
      href="#project-form"
      onClick={focusFormHeading}
    >
      Share your project
      <ArrowDown aria-hidden="true" size={17} />
    </a>
  );
}
