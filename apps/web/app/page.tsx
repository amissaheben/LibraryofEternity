import Link from "next/link";
import DocumentCard from "@/components/DocumentCard";
import { getDocuments, getHealth } from "@/lib/library";
export default function Home() {
  const health = getHealth(); const docs = getDocuments();
  const featured = docs.filter((d) => d.className === "AA" || d.className === "LAW").slice(0, 6);
  return <div className="page-wrap">
    <section className="hero"><div><span className="eyebrow">Constitutional Research Institution</span><h1>Browse the architecture of the <em>Infinite Weave.</em></h1><p>A versioned, auditable knowledge system connecting canon, constitutional law, institutional research, provenance, and dependency.</p><div className="actions"><Link className="button primary" href="/documents">Enter the Archive</Link><Link className="button" href="/graph">Explore the Graph</Link></div></div><div className="orb">∞</div></section>
    <section className="stats"><div><span>Release</span><strong>{health.release}</strong></div><div><span>Documents</span><strong>{health.documents}</strong></div><div><span>Graph nodes</span><strong>{health.graphNodes}</strong></div><div><span>Integrity</span><strong>{health.score}%</strong></div></section>
    <section className="section-head"><div><span className="eyebrow">Canonical core</span><h2>Foundation records</h2></div><Link href="/documents">View all →</Link></section>
    <section className="card-grid">{featured.map((document) => <DocumentCard key={document.path} document={document}/>)}</section>
  </div>;
}
