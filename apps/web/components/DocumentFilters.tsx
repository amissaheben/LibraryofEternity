"use client";

import { useMemo, useState } from "react";
import DocumentCard from "./DocumentCard";
import type { LibraryDocument } from "@/lib/types";

export default function DocumentFilters({ documents }: { documents: LibraryDocument[] }) {
  const [query, setQuery] = useState("");
  const [className, setClassName] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const classes = useMemo(() => ["ALL", ...Array.from(new Set(documents.map((d) => d.className))).sort()], [documents]);
  const statuses = useMemo(() => ["ALL", ...Array.from(new Set(documents.map((d) => d.status))).sort()], [documents]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesQuery = !q || `${doc.id} ${doc.title} ${doc.excerpt}`.toLowerCase().includes(q);
      const matchesClass = className === "ALL" || doc.className === className;
      const matchesStatus = status === "ALL" || doc.status === status;
      return matchesQuery && matchesClass && matchesStatus;
    });
  }, [documents, query, className, status]);

  return <>
    <div className="filter-bar">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by ID, title, or text…" />
      <select value={className} onChange={(e) => setClassName(e.target.value)}>{classes.map((item) => <option key={item}>{item}</option>)}</select>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
    </div>
    <p className="result-count">Showing {filtered.length} of {documents.length} records.</p>
    <div className="card-grid">{filtered.map((doc) => <DocumentCard key={doc.path} document={doc}/>)}</div>
  </>;
}
