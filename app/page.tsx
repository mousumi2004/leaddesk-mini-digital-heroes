import {
  Check,
  LayoutDashboard,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { LeadForm } from "@/components/lead/lead-form";
import { FormJumpLink } from "@/components/site/form-jump-link";

const benefits = [
  "Clear project details from the first message",
  "One secure place for every enquiry",
  "A simple path from new lead to closed",
];

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/">
            <span>LeadDesk Mini</span>
          </Link>
          <Link className="admin-link" href="/login">
            <LayoutDashboard aria-hidden="true" size={17} />
            Admin login
          </Link>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-glow one" />
          <div className="hero-glow two" />
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="hero-pill">
                <span className="pulse-dot" />
                Lead intake, simplified
              </div>
              <h1>
                Turn a project idea into a{" "}
                <span>clear next conversation.</span>
              </h1>
              <p className="hero-lede">
                LeadDesk Mini helps a small digital agency collect website and
                e-commerce enquiries, then follow each opportunity from first
                message to final outcome.
              </p>

              <ul className="benefit-list">
                {benefits.map((benefit) => (
                  <li key={benefit}>
                    <span>
                      <Check aria-hidden="true" size={15} strokeWidth={3} />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>

              <FormJumpLink />
            </div>

            <div className="form-shell">
              <div className="form-accent" />
              <LeadForm />
            </div>
          </div>
        </section>

        <section className="process-section" aria-labelledby="process-title">
          <div className="section-heading">
            <span className="eyebrow">One focused workflow</span>
            <h2 id="process-title">From enquiry to action in three steps.</h2>
          </div>
          <div className="process-grid">
            <article>
              <span className="step-number" aria-hidden="true">
                01
              </span>
              <MessageSquareText aria-hidden="true" />
              <h3>Share the brief</h3>
              <p>A potential client describes the project, budget, and goal.</p>
            </article>
            <article>
              <span className="step-number" aria-hidden="true">
                02
              </span>
              <ShieldCheck aria-hidden="true" />
              <h3>Review securely</h3>
              <p>Only an authorized administrator can view the submitted lead.</p>
            </article>
            <article>
              <span className="step-number" aria-hidden="true">
                03
              </span>
              <LayoutDashboard aria-hidden="true" />
              <h3>Track progress</h3>
              <p>The team marks each lead as New, Contacted, or Closed.</p>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
