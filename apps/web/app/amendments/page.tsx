import Link from "next/link";
import { getDocuments } from "@/lib/library";
import { readChangeLog } from "@/lib/repository";

export default function AmendmentsPage() {
  const docs = getDocuments();
  const changes = readChangeLog().slice().reverse();
  const amended = docs.filter((doc) => doc.provenance.amendmentReference || doc.provenance.supersedes.length || doc.provenance.supersededBy.length);
  return <div className="page-wrap">
    <header className="page-header"><span className="eyebrow">Constitutional history</span><h1>Amendments & Supersession</h1><p>Governed changes to locked records, retirement paths, and preserved institutional history.</p></header>
    <section className="card-grid amendment-summary"><div className="doc-card"><span className="eyebrow">Records</span><h3>{amended.length}</h3><p>Artifacts with amendment or supersession metadata.</p></div><div className="doc-card"><span className="eyebrow">Governed changes</span><h3>{changes.length}</h3><p>Machine-recorded repository revisions.</p></div><div className="doc-card"><span className="eyebrow">Retired</span><h3>{docs.filter((d) => /retired|superseded/i.test(d.status)).length}</h3><p>Artifacts retained for institutional memory.</p></div></section>
    <section className="section-head"><div><span className="eyebrow">Registered authority</span><h2>Amendment-linked artifacts</h2></div></section>
    <div className="card-grid">{amended.map((doc) => <Link className="doc-card" href={`/provenance/${encodeURIComponent(doc.id)}`} key={doc.id}><div className="doc-card-head"><span className="id-chip">{doc.id}</span><span className="status-chip">{doc.status}</span></div><h3>{doc.title}</h3><p>{doc.provenance.amendmentReference ? `Amendment: ${doc.provenance.amendmentReference}` : "Supersession lineage recorded."}</p></Link>)}</div>
    <section className="section-head history-head"><div><span className="eyebrow">Change ledger</span><h2>Institutional audit trail</h2></div></section>
    {changes.length ? <div className="timeline">{changes.map((change) => <article key={change.id}><span>{change.id}</span><div><Link href={`/provenance/${encodeURIComponent(change.documentId)}`}><strong>{change.documentId}</strong></Link><p>{change.summary}</p><small>{change.timestamp}</small></div><code>{change.currentHash}</code></article>)}</div> : <div className="empty-state">No governed modifications have been recorded yet.</div>}
  </div>;
}
