"use client";

import {
  CircleDot,
  LogOut,
  Mail,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { LeadDetailDialog } from "@/components/admin/lead-detail-dialog";
import {
  budgetLabels,
  leadStatuses,
  statusLabels,
  type LeadRecord,
  type LeadStatus,
} from "@/lib/leads/schema";

type LeadsResponse = {
  leads?: LeadRecord[];
  error?: string;
};

type StatusFilter = "all" | LeadStatus;

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

async function requestLeads(): Promise<LeadRecord[]> {
  const response = await fetch("/api/leads", { cache: "no-store" });
  const body = (await response.json()) as LeadsResponse;
  if (response.status === 401 || response.status === 403) {
    window.location.assign("/login");
    return [];
  }
  if (!response.ok || !body.leads) {
    throw new Error(body.error ?? "Unable to load leads right now.");
  }
  return body.leads;
}

export function AdminDashboard({ adminEmail }: { adminEmail: string }) {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setLeads(await requestLeads());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load leads right now.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    requestLeads()
      .then((data) => {
        if (active) {
          setLeads(data);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load leads right now.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredLeads = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesStatus =
        statusFilter === "all" || lead.status === statusFilter;
      const matchesQuery =
        !normalized ||
        lead.name.toLowerCase().includes(normalized) ||
        lead.email.toLowerCase().includes(normalized);

      return matchesStatus && matchesQuery;
    });
  }, [leads, query, statusFilter]);

  const counts = useMemo(
    () => ({
      total: leads.length,
      new: leads.filter((lead) => lead.status === "new").length,
      contacted: leads.filter((lead) => lead.status === "contacted").length,
      closed: leads.filter((lead) => lead.status === "closed").length,
    }),
    [leads],
  );

  async function changeStatus(leadId: string, nextStatus: LeadStatus) {
    const previous = leads.find((lead) => lead.id === leadId)?.status;
    if (!previous || previous === nextStatus) {
      return;
    }

    setError("");
    setSavingId(leadId);
    setLeads((current) =>
      current.map((lead) =>
        lead.id === leadId ? { ...lead, status: nextStatus } : lead,
      ),
    );

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? "Unable to update this lead.");
      }
    } catch (saveError) {
      setLeads((current) =>
        current.map((lead) =>
          lead.id === leadId ? { ...lead, status: previous } : lead,
        ),
      );
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update this lead.",
      );
    } finally {
      setSavingId("");
    }
  }

  function openLeadDetails(lead: LeadRecord, trigger: HTMLButtonElement) {
    returnFocusRef.current = trigger;
    setSelectedLead(lead);
  }

  const closeLeadDetails = useCallback(() => {
    setSelectedLead(null);
    window.requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, []);

  async function logout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.assign("/login");
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <span className="eyebrow">LeadDesk Mini</span>
            <h1>Lead overview</h1>
            <p>Review new project enquiries and keep every follow-up visible.</p>
          </div>
          <div className="admin-identity">
            <span>{adminEmail}</span>
            <button type="button" onClick={logout}>
              <LogOut aria-hidden="true" size={16} />
              Log out
            </button>
          </div>
        </header>

        <section className="summary-grid" aria-label="Lead status summary">
          <SummaryCard
            label="Total leads"
            value={counts.total}
            testId="count-total"
            tone="total"
          />
          <SummaryCard
            label="New"
            value={counts.new}
            testId="count-new"
            tone="new"
          />
          <SummaryCard
            label="Contacted"
            value={counts.contacted}
            testId="count-contacted"
            tone="contacted"
          />
          <SummaryCard
            label="Closed"
            value={counts.closed}
            testId="count-closed"
            tone="closed"
          />
        </section>

        <section className="leads-panel" aria-labelledby="leads-title">
          <div className="panel-toolbar">
            <div>
              <h2 id="leads-title">Project enquiries</h2>
              <p>{filteredLeads.length} visible leads</p>
            </div>
            <div
              className="status-filters"
              role="group"
              aria-label="Filter leads by status"
            >
              {statusFilters.map((filter) => (
                <button
                  type="button"
                  key={filter.value}
                  aria-pressed={statusFilter === filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                  <span aria-hidden="true">
                    {filter.value === "all"
                      ? counts.total
                      : counts[filter.value]}
                  </span>
                </button>
              ))}
            </div>
            <div className="toolbar-actions">
              <label className="search-control">
                <Search aria-hidden="true" size={17} />
                <span className="sr-only">Search leads</span>
                <input
                  type="search"
                  placeholder="Search name or email"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <button
                className="refresh-button"
                type="button"
                onClick={() => void loadLeads()}
                disabled={loading}
                aria-label="Refresh leads"
              >
                <RefreshCw
                  className={loading ? "spin" : undefined}
                  aria-hidden="true"
                  size={17}
                />
              </button>
            </div>
          </div>

          {error ? (
            <div className="dashboard-alert" role="alert">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="dashboard-state">
              <RefreshCw className="spin" aria-hidden="true" />
              <p>Loading project enquiries...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="dashboard-state">
              <Users aria-hidden="true" />
              <h3>No leads yet</h3>
              <p>New project requests will appear here automatically.</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="dashboard-state">
              <Search aria-hidden="true" />
              <h3>No matching leads</h3>
              <p>Change the status filter or search term and try again.</p>
            </div>
          ) : (
            <div className="lead-table" role="table" aria-label="Project leads">
              <div className="lead-row table-heading" role="row">
                <span role="columnheader">Lead</span>
                <span role="columnheader">Budget</span>
                <span role="columnheader">Received</span>
                <span role="columnheader">Status</span>
              </div>
              {filteredLeads.map((lead) => (
                <article className="lead-row" role="row" key={lead.id}>
                  <div className="lead-person" role="cell">
                    <span className="lead-avatar" aria-hidden="true">
                      {lead.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <h3>{lead.name}</h3>
                      <a href={`mailto:${lead.email}`}>
                        <Mail aria-hidden="true" size={13} />
                        {lead.email}
                      </a>
                      <p className="lead-message-preview">{lead.message}</p>
                      <button
                        className="lead-details-toggle"
                        type="button"
                        aria-label={`View full brief from ${lead.name}`}
                        onClick={(event) =>
                          openLeadDetails(lead, event.currentTarget)
                        }
                      >
                        View full brief
                      </button>
                    </div>
                  </div>
                  <div className="mobile-label" aria-hidden="true">
                    Budget
                  </div>
                  <div className="budget-cell" role="cell">
                    {budgetLabels[lead.budget]}
                  </div>
                  <div className="mobile-label" aria-hidden="true">
                    Received
                  </div>
                  <time role="cell" dateTime={lead.createdAt}>
                    {formatDate(lead.createdAt)}
                  </time>
                  <div className="mobile-label" aria-hidden="true">
                    Status
                  </div>
                  <div className="status-cell" role="cell">
                    <span className={`status-dot ${lead.status}`} />
                    <select
                      aria-label={`Status for ${lead.name}`}
                      value={lead.status}
                      disabled={savingId === lead.id}
                      onChange={(event) =>
                        void changeStatus(
                          lead.id,
                          event.target.value as LeadStatus,
                        )
                      }
                    >
                      {leadStatuses.map((status) => (
                        <option value={status} key={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      {selectedLead ? (
        <LeadDetailDialog lead={selectedLead} onClose={closeLeadDetails} />
      ) : null}
    </main>
  );
}

function SummaryCard({
  label,
  value,
  testId,
  tone,
}: {
  label: string;
  value: number;
  testId: string;
  tone: "total" | LeadStatus;
}) {
  return (
    <article className={`summary-card ${tone}`}>
      <div>
        <span>{label}</span>
        <strong data-testid={testId}>{value}</strong>
      </div>
      <CircleDot aria-hidden="true" />
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
