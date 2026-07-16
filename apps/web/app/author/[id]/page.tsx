import { notFound } from "next/navigation";
import AuthoringForm from "@/components/AuthoringForm";
import { getDocument, getDocuments } from "@/lib/library";
export default async function EditPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const document = getDocument(decodeURIComponent(id)); if (!document) notFound(); return <div className="page-wrap graph-page"><header className="page-header"><span className="eyebrow">Governed revision</span><h1>Edit {document.id}</h1><p>All previous content is snapshotted. Approved and locked records require an amendment reference.</p></header><AuthoringForm document={document} knownIds={getDocuments().map((doc) => doc.id)}/></div>; }
