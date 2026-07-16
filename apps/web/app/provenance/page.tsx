import Link from "next/link";
import { getDocuments, getProvenanceHealth } from "@/lib/library";

export default function ProvenancePage() {
  const docs = getDocuments();
  const health = getProvenanceHealth();
  return <div className="page-wrap">
    <header className="page-header"><span className="eyebrow">LC-0006</span><h1>Provenance Explorer</h1><p>Trace origin, dependencies, amendments, supersession, and institutional change history for every indexed record.</p></header>
    <section className="release-banner provenance-stats">
      <div><span>Coverage</span><strong>{health.coverage}%</strong></div>
      <div><span>Origin recorded</span><strong>{health.withOrigin}/{health.total}</strong></div>
      <div><span>Source recorded</span><strong>{health.withSource}</strong></div>
      <div><span>Broken lineage links</span><strong>{health.broken.length}</strong></div>
    </section>
    <div className="table-wrap"><table><thead><tr><th>ID</th><th>Artifact</th><th>Origin</th><th>Source</th><th>Dependencies</th><th>Status</th></tr></thead><tbody>{docs.map((doc) => <tr key={doc.id}><td><Link href={`/provenance/${encodeURIComponent(doc.id)}`}>{doc.id}</Link></td><td>{doc.title}</td><td>{doc.provenance.origin ?? "—"}</td><td>{doc.provenance.source ?? "—"}</td><td>{doc.dependencies.length}</td><td>{doc.status}</td></tr>)}</tbody></table></div>
  </div>;
}
