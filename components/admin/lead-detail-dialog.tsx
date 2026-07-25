"use client";

import { Mail, X } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  budgetLabels,
  statusLabels,
  type LeadRecord,
} from "@/lib/leads/schema";

type LeadDetailDialogProps = {
  lead: LeadRecord;
  onClose: () => void;
};

export function LeadDetailDialog({
  lead,
  onClose,
}: LeadDetailDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div
      className="lead-dialog-backdrop"
      data-testid="lead-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="lead-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`lead-dialog-title-${lead.id}`}
      >
        <button
          ref={closeButtonRef}
          className="lead-dialog-close"
          type="button"
          aria-label="Close project brief"
          onClick={onClose}
        >
          <X aria-hidden="true" size={20} />
        </button>

        <span className="eyebrow">Project enquiry</span>
        <h2 id={`lead-dialog-title-${lead.id}`}>
          Project brief from {lead.name}
        </h2>
        <a className="lead-dialog-email" href={`mailto:${lead.email}`}>
          <Mail aria-hidden="true" size={16} />
          {lead.email}
        </a>

        <dl className="lead-dialog-meta">
          <div>
            <dt>Budget</dt>
            <dd>{budgetLabels[lead.budget]}</dd>
          </div>
          <div>
            <dt>Received</dt>
            <dd>{formatLeadDate(lead.createdAt)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{statusLabels[lead.status]}</dd>
          </div>
        </dl>

        <div className="lead-dialog-brief">
          <span>Full brief</span>
          <p>{lead.message}</p>
        </div>
      </section>
    </div>
  );
}

function formatLeadDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
