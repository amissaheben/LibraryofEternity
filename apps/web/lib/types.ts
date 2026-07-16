export type LibraryDocument = {
  id: string;
  title: string;
  status: string;
  layer: string;
  className: string;
  stability?: string;
  evidence?: string;
  necessity?: string;
  dependencies: string[];
  path: string;
  excerpt: string;
  content: string;
  metadata: Record<string, unknown>;
  provenance: {
    origin?: string;
    source?: string;
    motivation?: string;
    alternatives: string[];
    amendmentReference?: string;
    supersedes: string[];
    supersededBy: string[];
    status?: string;
  };
};

export type GraphNode = { id: string; label?: string; type?: string; class?: string };
export type GraphEdge = { source: string; target: string; relation?: string };
export type RelatedDocument = { document: LibraryDocument; relation: string; direction: "incoming" | "outgoing" };
