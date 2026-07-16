import Link from "next/link";
import { BookOpen, FileClock, FilePenLine, FileSearch, GitFork, HeartPulse, Library, Network, PackageCheck, ScrollText, ShieldCheck } from "lucide-react";

const links = [
  ["/", "Overview", Library],
  ["/documents", "Documents", BookOpen],
  ["/registry", "Registry", ScrollText],
  ["/graph", "Graph", GitFork],
  ["/search", "Search", FileSearch],
  ["/health", "Health", HeartPulse],
  ["/provenance", "Provenance", Network],
  ["/amendments", "Amendments", FileClock],
  ["/author", "Author", FilePenLine],
  ["/review", "Review", ShieldCheck],
  ["/releases", "Releases", PackageCheck],
] as const;

export default function Shell({ children }: { children: React.ReactNode }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand" href="/"><span className="brand-mark">∞</span><span><strong>Library of Eternity</strong><small>Foundation v1.0 RC1</small></span></Link>
      <nav>{links.map(([href, label, Icon]) => <Link key={href} href={href}><Icon size={17}/><span>{label}</span></Link>)}</nav>
      <div className="lock-card"><span>Research Lock</span><strong>ACTIVE</strong><small>AA-0006 suspended</small></div>
    </aside>
    <main className="main">{children}</main>
  </div>;
}
