import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import YAML from "yaml";
import type { GraphEdge, GraphNode, LibraryDocument, RelatedDocument } from "./types";

const ROOT = path.resolve(process.cwd(), "..", "..", "foundation");

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function inferClass(relativePath: string, id: string): string {
  if (id.startsWith("AA-")) return "AA";
  if (id.startsWith("LAW-")) return "LAW";
  if (id.startsWith("LC-")) return "LC";
  if (id.startsWith("RP-")) return "RP";
  if (id.startsWith("AR-")) return "AR";
  if (id.startsWith("IA-")) return "IA";
  if (id.startsWith("IRN-")) return "IRN";
  if (relativePath.includes("INSTITUTION")) return "IH";
  return "DOC";
}

export function getDocuments(): LibraryDocument[] {
  const files = walk(ROOT).filter((file) => file.endsWith(".md"));
  return files.map((file) => {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = matter(raw);
    const relativePath = path.relative(ROOT, file).replaceAll(path.sep, "/");
    const fileId = path.basename(file, ".md").split("-").slice(0, 2).join("-");
    const id = String(parsed.data.id ?? fileId ?? path.basename(file, ".md"));
    const title = String(parsed.data.title ?? parsed.content.match(/^#\s+(.+)$/m)?.[1] ?? path.basename(file, ".md"));
    const plain = parsed.content.replace(/[#>*_`\-]/g, " ").replace(/\s+/g, " ").trim();
    return {
      id,
      title,
      status: String(parsed.data.status ?? "Unspecified"),
      layer: String(parsed.data.layer ?? (relativePath.startsWith("01-FOUNDATION") ? "Universe" : "Institution")),
      className: String(parsed.data.class ?? inferClass(relativePath, id)),
      stability: parsed.data.stability ? String(parsed.data.stability) : undefined,
      evidence: parsed.data.evidence_score ? String(parsed.data.evidence_score) : parsed.data.evidence ? String(parsed.data.evidence) : undefined,
      necessity: parsed.data.necessity_score ? String(parsed.data.necessity_score) : parsed.data.necessity ? String(parsed.data.necessity) : undefined,
      dependencies: Array.isArray(parsed.data.dependencies) ? parsed.data.dependencies.map(String) : [],
      path: relativePath,
      excerpt: plain.slice(0, 220),
      content: parsed.content,
      metadata: parsed.data,
      provenance: (() => {
        const raw = parsed.data.provenance;
        const value = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
        const list = (entry: unknown) => Array.isArray(entry) ? entry.map(String) : entry ? [String(entry)] : [];
        return {
          origin: value.origin ? String(value.origin) : undefined,
          source: value.source ? String(value.source) : undefined,
          motivation: value.motivation ? String(value.motivation) : parsed.data.motivation ? String(parsed.data.motivation) : undefined,
          alternatives: list(value.alternatives ?? parsed.data.alternatives),
          amendmentReference: parsed.data.amendment_reference ? String(parsed.data.amendment_reference) : value.amendment_reference ? String(value.amendment_reference) : undefined,
          supersedes: list(parsed.data.supersedes ?? value.supersedes),
          supersededBy: list(parsed.data.superseded_by ?? value.superseded_by),
          status: value.status ? String(value.status) : undefined,
        };
      })(),
    };
  }).sort((a, b) => a.id.localeCompare(b.id));
}

export function getDocument(id: string) {
  return getDocuments().find((document) => document.id.toLowerCase() === id.toLowerCase());
}

export function getGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const graphPath = path.join(ROOT, "05-GRAPH", "Graph.yaml");
  if (!fs.existsSync(graphPath)) return { nodes: [], edges: [] };
  const parsed = YAML.parse(fs.readFileSync(graphPath, "utf8")) ?? {};
  const rawEdges = Array.isArray(parsed.edges) ? parsed.edges : [];
  const edges: GraphEdge[] = rawEdges
    .map((edge: Record<string, unknown>) => ({
      source: String(edge.source ?? edge.from ?? ""),
      target: String(edge.target ?? edge.to ?? ""),
      relation: String(edge.relation ?? edge.type ?? "related_to"),
    }))
    .filter((edge: GraphEdge) => edge.source && edge.target);
  const nodes: GraphNode[] = Array.isArray(parsed.nodes) ? parsed.nodes : [];
  const known = new Set(nodes.map((node) => node.id));
  for (const edge of edges) {
    for (const id of [edge.source, edge.target]) {
      if (!known.has(id)) {
        nodes.push({ id, label: id.replaceAll("_", " ").replaceAll("-", " "), class: "CAPABILITY" });
        known.add(id);
      }
    }
  }
  return { nodes, edges };
}

export function getRelatedDocuments(id: string): RelatedDocument[] {
  const docs = getDocuments();
  const byId = new Map(docs.map((doc) => [doc.id.toLowerCase(), doc]));
  const graph = getGraph();
  const key = id.toLowerCase();
  const relations: RelatedDocument[] = [];

  for (const edge of graph.edges) {
    if (edge.source.toLowerCase() === key) {
      const document = byId.get(edge.target.toLowerCase());
      if (document) relations.push({ document, relation: edge.relation ?? "related_to", direction: "outgoing" });
    }
    if (edge.target.toLowerCase() === key) {
      const document = byId.get(edge.source.toLowerCase());
      if (document) relations.push({ document, relation: edge.relation ?? "related_to", direction: "incoming" });
    }
  }

  const current = byId.get(key);
  if (current) {
    for (const dependency of current.dependencies) {
      const document = byId.get(dependency.toLowerCase());
      if (document && !relations.some((item) => item.document.id === document.id)) {
        relations.push({ document, relation: "depends_on", direction: "outgoing" });
      }
    }
  }

  return relations.sort((a, b) => a.document.id.localeCompare(b.document.id));
}

export function getHealth() {
  const docs = getDocuments();
  const graph = getGraph();
  const classes = docs.reduce<Record<string, number>>((acc, doc) => {
    acc[doc.className] = (acc[doc.className] ?? 0) + 1;
    return acc;
  }, {});
  const locked = docs.filter((doc) => /locked|stable|complete|certified/i.test(doc.status)).length;
  const docIds = new Set(docs.map((doc) => doc.id));
  const graphIds = new Set(graph.nodes.map((node) => node.id));
  const brokenEdges = graph.edges.filter((edge) => !graphIds.has(edge.source) || !graphIds.has(edge.target));
  const missingDependencies = docs.flatMap((doc) => doc.dependencies.filter((dependency) => !docIds.has(dependency)).map((dependency) => `${doc.id} → ${dependency}`));
  const duplicateIds = docs.map((doc) => doc.id).filter((id, index, all) => all.indexOf(id) !== index);
  const issueCount = brokenEdges.length + missingDependencies.length + duplicateIds.length;
  const score = Math.max(0, Math.round(100 - issueCount * 4));
  return {
    documents: docs.length,
    graphNodes: graph.nodes.length,
    graphEdges: graph.edges.length,
    locked,
    classes,
    score,
    researchLock: true,
    release: "Foundation v1.0 RC1",
    brokenEdges: brokenEdges.length,
    missingDependencies,
    duplicateIds,
  };
}


export type ProvenanceLink = { id: string; title: string; kind: string; exists: boolean };

export function getProvenance(id: string) {
  const document = getDocument(id);
  if (!document) return undefined;
  const docs = getDocuments();
  const byId = new Map(docs.map((doc) => [doc.id.toUpperCase(), doc]));
  const changes = (() => {
    try {
      const logPath = path.join(ROOT, "03-INSTITUTION", "Governance", "change-log.json");
      if (!fs.existsSync(logPath)) return [];
      const records = JSON.parse(fs.readFileSync(logPath, "utf8"));
      return Array.isArray(records) ? records.filter((entry) => String(entry.documentId ?? "").toUpperCase() === document.id.toUpperCase()) : [];
    } catch { return []; }
  })();
  const link = (target: string, kind: string): ProvenanceLink => {
    const found = byId.get(target.toUpperCase());
    return { id: target, title: found?.title ?? target, kind, exists: Boolean(found) };
  };
  const upstream = document.dependencies.map((item) => link(item, "depends_on"));
  const downstream = docs.filter((item) => item.dependencies.some((dep) => dep.toUpperCase() === document.id.toUpperCase())).map((item) => link(item.id, "used_by"));
  const amendments = document.provenance.amendmentReference ? [link(document.provenance.amendmentReference, "amended_by")] : [];
  const supersedes = document.provenance.supersedes.map((item) => link(item, "supersedes"));
  const supersededBy = document.provenance.supersededBy.map((item) => link(item, "superseded_by"));
  return { document, upstream, downstream, amendments, supersedes, supersededBy, changes };
}

export function getProvenanceHealth() {
  const docs = getDocuments();
  const withOrigin = docs.filter((doc) => Boolean(doc.provenance.origin)).length;
  const withSource = docs.filter((doc) => Boolean(doc.provenance.source)).length;
  const withDependencies = docs.filter((doc) => doc.dependencies.length > 0).length;
  const amended = docs.filter((doc) => Boolean(doc.provenance.amendmentReference)).length;
  const retired = docs.filter((doc) => /retired|superseded/i.test(doc.status)).length;
  const broken = docs.flatMap((doc) => [...doc.dependencies, ...doc.provenance.supersedes, ...doc.provenance.supersededBy])
    .filter((id) => !docs.some((candidate) => candidate.id.toUpperCase() === id.toUpperCase()));
  const coverage = docs.length ? Math.round((withOrigin / docs.length) * 100) : 0;
  return { total: docs.length, withOrigin, withSource, withDependencies, amended, retired, broken: [...new Set(broken)], coverage };
}
