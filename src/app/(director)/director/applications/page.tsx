"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { api } from "@/lib/api";
import { Application, Customer } from "@/lib/types";
import toast from "react-hot-toast";
import {
  FileText,
  Search,
  X,
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Users,
  AlertTriangle,
  ExternalLink,
  Clock,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocumentRow = {
  id: string;
  title: string;
  type: string;
  customer_id: string;
  customer_ref: string;
  file_url: string;
  generated_date: string | null;
  created_at: string;
};

type ConfirmAction = "approve" | "reject" | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Pending Review": "bg-blue-100 text-blue-700 border-blue-200",
    "Returned to Director": "bg-orange-100 text-orange-700 border-orange-200",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DirectorApplicationsPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [applications, setApplications] = useState<Application[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Detail panel
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Documents for selected app
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  // Remarks / notes
  const [remarks, setRemarks] = useState("");
  const [remarksError, setRemarksError] = useState("");

  // Confirm dialog
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // Action loading
  const [actionLoading, setActionLoading] = useState(false);

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allApps, allCustomers] = await Promise.all([
        api.getApplications(),
        api.getCustomers(),
      ]);

      const filtered = (allApps as Application[]).filter(
        (a) =>
          a.status === "Pending Review" || a.status === "Returned to Director"
      );

      setApplications(filtered);
      setCustomers(allCustomers as Customer[]);
    } catch (err) {
      console.error("Failed to load applications:", err);
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data?.user?.id ?? null);
    });
  }, [loadData]);

  // Load documents when selected app changes
  useEffect(() => {
    if (!selectedApp?.customerId) {
      setDocuments([]);
      return;
    }
    setDocsLoading(true);
    api
      .getDocuments(selectedApp.customerId)
      .then((docs) => setDocuments(docs as DocumentRow[]))
      .catch(() => setDocuments([]))
      .finally(() => setDocsLoading(false));
  }, [selectedApp?.customerId]);

  // ── Derived data ────────────────────────────────────────────────────────────

  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c]));

  const filtered = applications.filter((app) => {
    const customer = customerMap[app.customerId ?? ""];
    const q = search.toLowerCase();
    return (
      app.ref?.toLowerCase().includes(q) ||
      customer?.fullName?.toLowerCase().includes(q) ||
      false
    );
  });

  // ── Panel helpers ───────────────────────────────────────────────────────────

  function openPanel(app: Application) {
    setSelectedApp(app);
    setRemarks("");
    setRemarksError("");
    setConfirmAction(null);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setSelectedApp(null);
    setRemarks("");
    setRemarksError("");
    setConfirmAction(null);
  }

  // ── Supabase direct helpers ─────────────────────────────────────────────────

  async function insertActivityLog(
    userId: string,
    action: string,
    app: Application,
    extra: Record<string, unknown>
  ) {
    const supabase = createClient();
    await supabase.from("activity_logs").insert({
      user_id: userId,
      module: "Applications",
      action,
      details: {
        appId: app.id,
        ref: app.ref,
        previousStatus: app.status,
        ...extra,
      },
    });
  }

  async function notifyChairman(app: Application) {
    const supabase = createClient();
    const { data: chairmanProfiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "Chairman")
      .eq("active_status", true);

    for (const cp of chairmanProfiles ?? []) {
      await supabase.from("notifications").insert({
        user_id: cp.id,
        title: "Application Ready for Chairman Review",
        message: `Application ${app.ref} has been reviewed and approved by the Director. Awaiting your final approval.`,
        type: "System",
        read_status: false,
      });
    }
  }

  async function notifySecretary(
    app: Application,
    title: string,
    message: string
  ) {
    const supabase = createClient();
    const { data: secretaryProfiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "Secretary")
      .eq("active_status", true);

    for (const sp of secretaryProfiles ?? []) {
      await supabase.from("notifications").insert({
        user_id: sp.id,
        title,
        message,
        type: "Alert",
        read_status: false,
      });
    }
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function handleApprove() {
    if (!selectedApp || !currentUserId) return;
    if (!remarks.trim()) {
      setRemarksError("Director remarks are required before approving.");
      return;
    }
    setConfirmAction("approve");
  }

  async function executeApprove() {
    if (!selectedApp || !currentUserId) return;
    setActionLoading(true);
    try {
      await api.saveApplication({
        ...selectedApp,
        status: "Director Approved",
        reviewedBy: currentUserId,
      });

      await insertActivityLog(
        currentUserId,
        "Director Approved Application",
        selectedApp,
        { newStatus: "Director Approved", directorRemarks: remarks }
      );

      await notifyChairman(selectedApp);

      toast.success("Application approved. Chairman has been notified.");
      closePanel();
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve application.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleReject() {
    if (!selectedApp || !currentUserId) return;
    if (!remarks.trim()) {
      setRemarksError("A rejection reason is required.");
      return;
    }
    setConfirmAction("reject");
  }

  async function executeReject() {
    if (!selectedApp || !currentUserId) return;
    setActionLoading(true);
    try {
      await api.saveApplication({
        ...selectedApp,
        status: "Rejected",
        reviewedBy: currentUserId,
      });

      await insertActivityLog(
        currentUserId,
        "Director Rejected Application",
        selectedApp,
        { newStatus: "Rejected", directorRemarks: remarks }
      );

      await notifySecretary(
        selectedApp,
        "Application Rejected by Director",
        `Application ${selectedApp.ref} has been rejected. Reason: ${remarks}`
      );

      toast.success("Application rejected. Secretary has been notified.");
      closePanel();
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject application.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRequestCorrection() {
    if (!selectedApp || !currentUserId) return;
    if (!remarks.trim()) {
      setRemarksError("Correction notes are required.");
      return;
    }
    setActionLoading(true);
    try {
      await api.saveApplication({
        ...selectedApp,
        status: "Returned to Secretary",
        reviewedBy: currentUserId,
      });

      await insertActivityLog(
        currentUserId,
        "Director Requested Correction",
        selectedApp,
        { newStatus: "Returned to Secretary", correctionNotes: remarks }
      );

      await notifySecretary(
        selectedApp,
        "Correction Requested by Director",
        `Application ${selectedApp.ref} has been returned for correction. Notes: ${remarks}`
      );

      toast.success(
        "Correction requested. Application returned to Secretary."
      );
      closePanel();
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to return application.");
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmExecute() {
    if (confirmAction === "approve") await executeApprove();
    else if (confirmAction === "reject") await executeReject();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  const selectedCustomer = selectedApp
    ? customerMap[selectedApp.customerId ?? ""]
    : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ── Page Header ── */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Application Inbox</h1>
          <p className="text-sm text-gray-500">
            Review and action pending applications
          </p>
        </div>
        {!loading && (
          <span
            className="ml-2 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-bold text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {filtered.length}
          </span>
        )}
      </div>

      {/* ── Search ── */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by app no. or customer name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              No applications pending review
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Applications forwarded by the Secretary will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  {[
                    "App No.",
                    "Customer",
                    "Phone",
                    "Submitted Date",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((app) => {
                  const customer = customerMap[app.customerId ?? ""];
                  return (
                    <tr
                      key={app.id}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                        {app.ref ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {customer?.fullName ?? "Unknown Customer"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {customer?.email ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {customer?.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status ?? ""} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openPanel(app)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                          style={{
                            backgroundColor: "var(--color-primary)",
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Review
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Slide-Over Backdrop ── */}
      {panelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={closePanel}
        />
      )}

      {/* ── Slide-Over Panel ── */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl transition-transform duration-300 ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedApp && (
          <>
            {/* Panel Header */}
            <div
              className="flex items-center justify-between border-b border-gray-200 px-6 py-4"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-white" />
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Application — {selectedApp.ref}
                  </h2>
                  <p className="text-xs text-white/70">Director Review</p>
                </div>
              </div>
              <button
                onClick={closePanel}
                className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              {/* Application Info */}
              <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <FileText className="h-3.5 w-3.5" />
                  Application Info
                </h3>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-gray-400">Reference</dt>
                    <dd className="font-mono font-semibold text-gray-900">
                      {selectedApp.ref ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Submitted</dt>
                    <dd className="text-gray-700">
                      {formatDate(selectedApp.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Status</dt>
                    <dd>
                      <StatusBadge status={selectedApp.status ?? ""} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Documents Verified</dt>
                    <dd className="flex items-center gap-1">
                      {selectedApp.documentsVerified ? (
                        <>
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-green-600">
                            Verified
                          </span>
                        </>
                      ) : (
                        <>
                          <ShieldX className="h-4 w-4 text-red-400" />
                          <span className="font-medium text-red-500">
                            Not Verified
                          </span>
                        </>
                      )}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Customer Info */}
              <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <User className="h-3.5 w-3.5" />
                  Customer Information
                </h3>
                {selectedCustomer ? (
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="col-span-2">
                      <dt className="text-xs text-gray-400">Full Name</dt>
                      <dd className="font-semibold text-gray-900">
                        {selectedCustomer.fullName}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone className="h-3 w-3" /> Phone
                      </dt>
                      <dd className="text-gray-700">
                        {selectedCustomer.phone ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone className="h-3 w-3" /> WhatsApp
                      </dt>
                      <dd className="text-gray-700">
                        {selectedCustomer.whatsapp ?? "—"}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="flex items-center gap-1 text-xs text-gray-400">
                        <Mail className="h-3 w-3" /> Email
                      </dt>
                      <dd className="text-gray-700">
                        {selectedCustomer.email ?? "—"}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" /> Address
                      </dt>
                      <dd className="text-gray-700">
                        {selectedCustomer.address ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1 text-xs text-gray-400">
                        <Briefcase className="h-3 w-3" /> Occupation
                      </dt>
                      <dd className="text-gray-700">
                        {selectedCustomer.occupation ?? "—"}
                      </dd>
                    </div>
                    <div />
                    <div className="col-span-2 border-t border-gray-200 pt-3">
                      <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-500">
                        <Users className="h-3 w-3" /> Next of Kin
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <dt className="text-xs text-gray-400">Name</dt>
                          <dd className="text-gray-700">
                            {selectedCustomer.nextOfKinName ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-400">Phone</dt>
                          <dd className="text-gray-700">
                            {selectedCustomer.nextOfKinPhone ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-400">Relation</dt>
                          <dd className="text-gray-700">
                            {selectedCustomer.nextOfKinRelationship ?? "—"}
                          </dd>
                        </div>
                      </div>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-gray-400">
                    Customer record not found.
                  </p>
                )}
              </section>

              {/* Documents */}
              <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <FileText className="h-3.5 w-3.5" />
                  Documents
                </h3>
                {docsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    Loading documents…
                  </div>
                ) : documents.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-400">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    No documents attached —{" "}
                    <span className="font-semibold">NOT AVAILABLE</span>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {documents.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center justify-between py-2.5 text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {doc.title}
                          </p>
                          <p className="text-xs text-gray-400">{doc.type}</p>
                        </div>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Inspection — NOT AVAILABLE */}
              <section className="rounded-xl border border-dashed border-gray-300 bg-gray-50/30 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  Inspection Report
                </h3>
                <div className="flex items-start gap-2 text-sm text-gray-400">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <span>
                    <span className="font-semibold">NOT AVAILABLE</span> —
                    Dependency on Admin Engineer Module. Inspection records will
                    appear here once that module is integrated.
                  </span>
                </div>
              </section>

              {/* Timeline */}
              <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  Timeline
                </h3>
                <ol className="relative ml-2 border-l border-gray-200 text-sm">
                  <li className="mb-4 ml-4">
                    <span className="absolute -left-1.5 mt-1 flex h-3 w-3 rounded-full bg-blue-400 ring-2 ring-white" />
                    <p className="font-medium text-gray-700">
                      Application Submitted by Secretary
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(selectedApp.createdAt)}
                    </p>
                  </li>
                  <li className="ml-4">
                    <span
                      className="absolute -left-1.5 mt-1 flex h-3 w-3 rounded-full ring-2 ring-white"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    />
                    <p className="font-medium text-gray-700">Current Status</p>
                    <div className="mt-0.5">
                      <StatusBadge status={selectedApp.status ?? ""} />
                    </div>
                  </li>
                </ol>
              </section>

              {/* Director Remarks */}
              <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Director Remarks{" "}
                  <span className="text-red-500">*</span>
                </h3>
                <p className="mb-2 text-xs text-gray-400">
                  Required for all actions — Approve, Reject, or Request
                  Correction.
                </p>
                <textarea
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.target.value);
                    if (e.target.value.trim()) setRemarksError("");
                  }}
                  rows={4}
                  placeholder="Enter your remarks, approval notes, rejection reason, or correction instructions…"
                  className={`w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                    remarksError
                      ? "border-red-300"
                      : "border-gray-200 focus:border-transparent"
                  }`}
                />
                {remarksError && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertTriangle className="h-3 w-3" />
                    {remarksError}
                  </p>
                )}
              </section>

              {/* Inline Confirm Dialog */}
              {confirmAction && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800">
                        {confirmAction === "approve"
                          ? "Confirm Approval"
                          : "Confirm Rejection"}
                      </p>
                      <p className="mt-0.5 text-xs text-amber-700">
                        {confirmAction === "approve"
                          ? `You are about to approve Application ${selectedApp.ref} and forward it to the Chairman. This cannot be undone.`
                          : `You are about to reject Application ${selectedApp.ref}. The Secretary will be notified with your reason.`}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => setConfirmAction(null)}
                          disabled={actionLoading}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmExecute}
                          disabled={actionLoading}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 ${
                            confirmAction === "approve"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {actionLoading ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : confirmAction === "approve" ? (
                            <CheckCircle className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {actionLoading
                            ? "Processing…"
                            : confirmAction === "approve"
                            ? "Yes, Approve & Forward to Chairman"
                            : "Yes, Reject & Notify Secretary"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer — Action Buttons */}
            {!confirmAction && (
              <div className="border-t border-gray-200 bg-white px-6 py-4">
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={handleRequestCorrection}
                    disabled={actionLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                    Request Correction
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
