"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import documents from "@/public/documents-index.json";
type IndexDoc = { id: string; title: string; excerpt: string; className: string; status: string };
export default function SearchPage() { const [q, setQ] = useState(""); const results = useMemo(() => { const query=q.trim().toLowerCase(); return (documents as IndexDoc[]).filter((d) => !query || `${d.id} ${d.title} ${d.excerpt}`.toLowerCase().includes(query)).slice(0,50); }, [q]); return <div className="page-wrap"><header className="page-header"><span className="eyebrow">Discovery</span><h1>Search the Library</h1><p>Search document identifiers, titles, and extracted text.</p></header><input className="search-input" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search Identity, Resonance, AA-0002..."/><div className="search-results">{results.map((d)=><Link key={d.id} href={`/documents/${d.id}`}><span className="id-chip">{d.id}</span><div><strong>{d.title}</strong><p>{d.excerpt}</p></div><small>{d.className}</small></Link>)}</div></div>; }
