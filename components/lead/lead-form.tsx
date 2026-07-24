"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  budgetLabels,
  budgetValues,
  leadInputSchema,
  type LeadInput,
} from "@/lib/leads/schema";

type ApiResponse = {
  message?: string;
  error?: string;
  issues?: Partial<Record<keyof LeadInput, string[]>>;
};

const defaults: LeadInput = {
  name: "",
  email: "",
  budget: "under-1000",
  message: "",
  company: "",
};

export function LeadForm() {
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadInputSchema),
    defaultValues: defaults,
  });

  const submit = handleSubmit(async (values) => {
    setNotice(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await response.json()) as ApiResponse;

      if (!response.ok) {
        if (body.issues) {
          for (const [field, messages] of Object.entries(body.issues)) {
            const message = messages?.[0];
            if (message) {
              setError(field as keyof LeadInput, { message });
            }
          }
        }
        setNotice({
          kind: "error",
          text: body.error ?? "Unable to save your request right now.",
        });
        return;
      }

      reset(defaults);
      setNotice({
        kind: "success",
        text: body.message ?? "Your project request has been received.",
      });
    } catch {
      setNotice({
        kind: "error",
        text: "We could not connect. Check your connection and try again.",
      });
    }
  });

  return (
    <form className="lead-form" onSubmit={submit} noValidate>
      <div className="form-heading">
        <span className="eyebrow">Start a conversation</span>
        <h2 id="project-form" tabIndex={-1}>
          Tell us what you&apos;re building.
        </h2>
        <p>Share the essentials. A project specialist can take it from there.</p>
      </div>

      <div className="field-grid">
        <Field label="Name" error={errors.name?.message}>
          <input
            id="name"
            autoComplete="name"
            placeholder="Your full name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </Field>
      </div>

      <Field label="Budget range" error={errors.budget?.message}>
        <select
          id="budget"
          required
          aria-invalid={Boolean(errors.budget)}
          aria-describedby={errors.budget ? "budget-error" : undefined}
          {...register("budget")}
        >
          {budgetValues.map((value) => (
            <option key={value} value={value}>
              {budgetLabels[value]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Project details" error={errors.message?.message}>
        <textarea
          id="message"
          rows={5}
          placeholder="What do you need, and what would a successful result look like?"
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
        />
      </Field>

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="company">Company website</label>
        <input
          id="company"
          tabIndex={-1}
          autoComplete="off"
          {...register("company")}
        />
      </div>

      {notice ? (
        <div
          className={`form-notice ${notice.kind}`}
          role={notice.kind === "success" ? "status" : "alert"}
        >
          {notice.kind === "success" ? (
            <CheckCircle2 aria-hidden="true" size={19} />
          ) : null}
          <span>{notice.text}</span>
        </div>
      ) : null}

      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoaderCircle className="spin" aria-hidden="true" size={19} />
            Sending request
          </>
        ) : (
          <>
            Send project request
            <ArrowRight aria-hidden="true" size={19} />
          </>
        )}
      </button>

      <p className="privacy-note">
        Your details are used only to respond to this project enquiry.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const id = label === "Project details" ? "message" : label.toLowerCase().split(" ")[0];

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
