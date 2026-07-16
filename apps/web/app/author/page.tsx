import AuthoringForm from "@/components/AuthoringForm";
import { getDocuments } from "@/lib/library";
export default function AuthorPage() { const docs = getDocuments(); return <div className="page-wrap graph-page"><header className="page-header"><span className="eyebrow">Trustee workspace</span><h1>Create governed record</h1><p>Draft research and institutional artifacts with repository validation before they enter the archive.</p></header><AuthoringForm knownIds={docs.map((doc) => doc.id)}/></div>; }
