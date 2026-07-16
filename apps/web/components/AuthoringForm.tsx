"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DOCUMENT_CLASSES, EVIDENCE_SCORES, NECESSITY_SCORES, STABILITY_CLASSES, WORKFLOW_STATES, type DocumentClass, type GovernedDocumentInput, type WorkflowState } from "@/lib/governance";
import type { LibraryDocument } from "@/lib/types";

type Issue = { field: string; message: string; severity: "error" | "warning" };

function toInput(document?: LibraryDocument): GovernedDocumentInput {
  const metadata = document?.metadata ?? {};
  return {
    originalId: document?.id,
    id: document?.id ?? "",
    title: document?.title ?? "",
    className: (document?.className ?? "RP") as DocumentClass,
    status: (document?.status ?? "Draft") as WorkflowState,
    layer: document?.layer ?? "Institution",
    stability: document?.stability ?? "Unclassified",
    evidence: document?.evidence ?? "",
    necessity: document?.necessity ?? "",
    dependencies: document?.dependencies ?? [],
    amendmentReference: String(metadata.amendment_reference ?? ""),
    changeSummary: "",
    content: document?.content ?? "# New Record\n\nBegin the governed record here.",
  };
}

export default function AuthoringForm({ document, knownIds }: { document?: LibraryDocument; knownIds: string[] }) {
  const router = useRouter();
  const [form, setForm] = useState<GovernedDocumentInput>(() => toInput(document));
  const [dependencyText, setDependencyText] = useState(form.dependencies.join(", "));
  const [issues, setIssues] = useState<Issue[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const isEditing = Boolean(document);
  const dependencySuggestions = useMemo(() => knownIds.filter((id) => !form.dependencies.includes(id)).slice(0, 16), [knownIds, form.dependencies]);
  function update<K extends keyof GovernedDocumentInput>(key: K, value: GovernedDocumentInput[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function normalized() { return { ...form, dependencies: dependencyText.split(/[,\n]/).map((item) => item.trim()).filter(Boolean) }; }
  async function submit(mode: "validate" | "save") {
    setBusy(true); setMessage("");
    const response = await fetch("/api/author", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...normalized(), mode }) });
    const data = await response.json(); setIssues(data.issues ?? []); setBusy(false);
    if (data.ok && mode === "validate") setMessage(data.issues?.length ? "Validation completed with advisory warnings." : "Validation passed.");
    if (data.ok && mode === "save") { setMessage("Record saved and change history updated."); router.push(`/documents/${encodeURIComponent(data.documentId)}`); router.refresh(); }
  }
  return <div className="author-grid">
    <form className="author-form" onSubmit={(event) => { event.preventDefault(); void submit("save"); }}>
      <div className="form-section"><span className="eyebrow">Identity</span><div className="form-grid two"><label>Document ID<input value={form.id} disabled={isEditing} onChange={(e) => update("id", e.target.value.toUpperCase())}/></label><label>Class<select value={form.className} disabled={isEditing} onChange={(e) => update("className", e.target.value as DocumentClass)}>{DOCUMENT_CLASSES.map((value) => <option key={value}>{value}</option>)}</select></label></div><label>Title<input value={form.title} onChange={(e) => update("title", e.target.value)}/></label></div>
      <div className="form-section"><span className="eyebrow">Governance</span><div className="form-grid three"><label>Workflow<select value={form.status} onChange={(e) => update("status", e.target.value as WorkflowState)}>{WORKFLOW_STATES.map((value) => <option key={value}>{value}</option>)}</select></label><label>Stability<select value={form.stability} onChange={(e) => update("stability", e.target.value)}>{STABILITY_CLASSES.map((value) => <option key={value}>{value}</option>)}</select></label><label>Layer<input value={form.layer} onChange={(e) => update("layer", e.target.value)}/></label><label>Evidence<select value={form.evidence} onChange={(e) => update("evidence", e.target.value)}>{EVIDENCE_SCORES.map((value) => <option key={value} value={value}>{value || "None"}</option>)}</select></label><label>Necessity<select value={form.necessity} onChange={(e) => update("necessity", e.target.value)}>{NECESSITY_SCORES.map((value) => <option key={value} value={value}>{value || "None"}</option>)}</select></label></div><label>Dependencies<textarea rows={3} value={dependencyText} onChange={(e) => setDependencyText(e.target.value)} placeholder="LAW-0001, LC-0005"/></label><div className="suggestions">{dependencySuggestions.map((id) => <button type="button" key={id} onClick={() => setDependencyText((current) => current ? `${current}, ${id}` : id)}>{id}</button>)}</div></div>
      <div className="form-section"><span className="eyebrow">Change control</span><div className="form-grid two"><label>Amendment reference<input value={form.amendmentReference} onChange={(e) => update("amendmentReference", e.target.value)} placeholder="ADR-0009 or amendment ID"/></label><label>Change summary<input value={form.changeSummary} onChange={(e) => update("changeSummary", e.target.value)} placeholder="Describe this revision"/></label></div></div>
      <div className="form-section"><span className="eyebrow">Record</span><label>Markdown content<textarea className="content-editor" rows={24} value={form.content} onChange={(e) => update("content", e.target.value)}/></label></div>
      <div className="form-actions"><button type="button" className="button" disabled={busy} onClick={() => void submit("validate")}>Validate</button><button className="button primary" disabled={busy}>{busy ? "Processing…" : isEditing ? "Save revision" : "Create record"}</button></div>
      {message && <p className="success-message">{message}</p>}
    </form>
    <aside className="validation-panel"><span className="eyebrow">Constitutional checks</span><h2>Validation</h2><p className="muted">Research Lock blocks new AA, FO and ADR records. Locked or approved records require an amendment reference.</p>{issues.length === 0 ? <div className="empty-state">Run validation to inspect this record.</div> : <ul className="issue-list">{issues.map((issue, index) => <li className={issue.severity} key={`${issue.field}-${index}`}><strong>{issue.field}</strong><span>{issue.message}</span></li>)}</ul>}</aside>
  </div>;
}
