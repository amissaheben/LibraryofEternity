import DocumentFilters from "@/components/DocumentFilters";
import { getDocuments } from "@/lib/library";

export default function DocumentsPage() {
  const docs = getDocuments();
  return <div className="page-wrap">
    <header className="page-header"><span className="eyebrow">Archive</span><h1>Documents</h1><p>{docs.length} indexed Markdown records from the Foundation repository.</p></header>
    <DocumentFilters documents={docs}/>
  </div>;
}
