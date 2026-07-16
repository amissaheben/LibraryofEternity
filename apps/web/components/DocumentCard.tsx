import Link from "next/link";
import type { LibraryDocument } from "@/lib/types";
export default function DocumentCard({ document }: { document: LibraryDocument }) {
  return <Link href={`/documents/${encodeURIComponent(document.id)}`} className="doc-card">
    <div className="doc-card-head"><span className="id-chip">{document.id}</span><span className="status-chip">{document.status}</span></div>
    <h3>{document.title}</h3><p>{document.excerpt || "No summary available."}</p>
    <div className="doc-meta"><span>{document.className}</span><span>{document.layer}</span></div>
  </Link>;
}
