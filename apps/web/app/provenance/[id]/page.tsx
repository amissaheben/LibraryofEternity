import Link from "next/link";
import { notFound } from "next/navigation";
import { getDocuments, getProvenance } from "@/lib/library";

export function generateStaticParams() { return getDocuments().map((doc) => ({ id: doc.id })); }

export default async function ProvenanceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = getProvenance(decodeURIComponent(id));
  if (!record) notFound();
  const { document: doc } = record;
  const groups = [
    ["Upstream dependencies", record.upstream],
    ["Downstream dependants", record.downstream],
    ["Amendment authority", record.amendments],
    ["Supersedes", record.supersedes],
    ["Superseded by", record.supersededBy],
  ] as const;
  return <div className="page-wrap narrow">
    <header className="document-header"><span className="eyebrow">Constitutional lineage</span><div className="doc-card-head"><span className="id-chip">{doc.id}</span><span className="status-chip">{doc.status}</span></div><h1>{doc.title}</h1><p className="path">{doc.path}</p><div className="document-actions"><Link className="button" href={`/documents/${encodeURIComponent(doc.id)}`}>Open document</Link><Link className="button" href={`/history/${encodeURIComponent(doc.id)}`}>Revision history</Link></div></header>
    <section className="provenance-card"><span className="eyebrow">Provenance header</span><dl><div><dt>Origin</dt><dd>{doc.provenance.origin ?? "Not recorded"}</dd></div><div><dt>Source</dt><dd>{doc.provenance.source ?? "Not recorded"}</dd></div><div><dt>Motivating problem</dt><dd>{doc.provenance.motivation ?? "Not recorded"}</dd></div><div><dt>Evidence / Necessity</dt><dd>{doc.evidence ?? "—"} / {doc.necessity ?? "—"}</dd></div><div><dt>Stability</dt><dd>{doc.stability ?? "Unclassified"}</dd></div></dl></section>
    {groups.map(([title, links]) => <section className="lineage-section" key={title}><h2>{title}</h2>{links.length ? <div className="lineage-links">{links.map((item) => item.exists ? <Link key={`${item.kind}-${item.id}`} href={`/provenance/${encodeURIComponent(item.id)}`}><span className="id-chip">{item.id}</span><strong>{item.title}</strong><small>{item.kind}</small></Link> : <div className="broken-lineage" key={`${item.kind}-${item.id}`}><span>{item.id}</span><small>Unresolved {item.kind}</small></div>)}</div> : <p className="muted">No records.</p>}</section>)}
    <section className="lineage-section"><h2>Institutional change trail</h2>{record.changes.length ? <div className="timeline">{record.changes.slice().reverse().map((change: any) => <article key={change.id}><span>{change.id}</span><div><strong>{change.action}</strong><p>{change.summary}</p><small>{change.timestamp}</small>{change.amendmentReference && <small>Authority: {change.amendmentReference}</small>}</div><code>{change.currentHash}</code></article>)}</div> : <p className="muted">No governed revisions have been recorded.</p>}</section>
  </div>;
}
