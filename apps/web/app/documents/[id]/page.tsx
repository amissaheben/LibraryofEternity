import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getDocument, getDocuments, getRelatedDocuments } from "@/lib/library";
export function generateStaticParams() { return getDocuments().map((d) => ({ id: d.id })); }
export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = getDocument(decodeURIComponent(id));
  if (!doc) notFound();
  const related = getRelatedDocuments(doc.id);
  return <div className="page-wrap narrow"><header className="document-header"><div className="doc-card-head"><span className="id-chip">{doc.id}</span><span className="status-chip">{doc.status}</span></div><h1>{doc.title}</h1><p className="path">{doc.path}</p><div className="document-actions"><Link className="button" href={`/provenance/${encodeURIComponent(doc.id)}`}>Provenance</Link><Link className="button" href={`/history/${encodeURIComponent(doc.id)}`}>Revision history</Link><Link className="button primary" href={`/author/${encodeURIComponent(doc.id)}`}>Edit record</Link></div><div className="metadata-grid"><span><b>Class</b>{doc.className}</span><span><b>Layer</b>{doc.layer}</span><span><b>Evidence</b>{doc.evidence ?? "—"}</span><span><b>Necessity</b>{doc.necessity ?? "—"}</span></div></header>{related.length > 0 && <section className="related-panel"><div><span className="eyebrow">Knowledge graph</span><h2>Related records</h2></div><div className="related-links">{related.map(({ document, relation, direction }) => <Link key={`${direction}-${relation}-${document.id}`} href={`/documents/${encodeURIComponent(document.id)}`}><span className="id-chip">{document.id}</span><strong>{document.title}</strong><small>{direction === "outgoing" ? "→" : "←"} {relation}</small></Link>)}</div></section>}<article className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown></article></div>;
}
