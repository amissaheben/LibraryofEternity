"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { GraphEdge, GraphNode } from "@/lib/types";

const classColors: Record<string, string> = {
  AA: "#d7b66d",
  LAW: "#90b8a8",
  LC: "#9ca9d8",
  RP: "#d79a8f",
  AR: "#c89bd8",
};

export default function GraphExplorer({ nodes: rawNodes, edges: rawEdges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const nodes = useMemo<Node[]>(() => rawNodes.map((node, index) => ({
    id: node.id,
    position: { x: (index % 4) * 250, y: Math.floor(index / 4) * 155 },
    data: { label: `${node.id}\n${node.label ?? ""}` },
    style: { background: "#10211e", color: "#f2efe6", border: `1px solid ${classColors[node.class ?? node.type ?? ""] ?? "#48645c"}`, borderRadius: 12, width: 190, whiteSpace: "pre-line", fontSize: 12 },
  })), [rawNodes]);
  const edges = useMemo<Edge[]>(() => rawEdges.map((edge, index) => ({
    id: `${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    label: edge.relation,
    animated: edge.relation === "depends_on",
    style: { stroke: "#65847b" },
    labelStyle: { fill: "#9dafaa", fontSize: 10 },
  })), [rawEdges]);
  const connected = useMemo(() => selected ? rawEdges.filter((edge) => edge.source === selected || edge.target === selected) : [], [selected, rawEdges]);
  const onNodeClick = useCallback((_: unknown, node: Node) => setSelected(node.id), []);

  return <div className="graph-layout">
    <div className="graph-canvas"><ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={onNodeClick}><Background gap={24} size={1}/><MiniMap nodeColor={(node) => String(node.style?.borderColor ?? "#48645c")}/><Controls/></ReactFlow></div>
    <aside className="graph-inspector">
      <span className="eyebrow">Inspector</span>
      {selected ? <><h2>{selected}</h2><Link className="button" href={`/documents/${encodeURIComponent(selected)}`}>Open document</Link><h3>Relationships</h3>{connected.length ? <ul>{connected.map((edge, i) => <li key={`${edge.source}-${edge.target}-${i}`}><b>{edge.source}</b> <span>{edge.relation}</span> <b>{edge.target}</b></li>)}</ul> : <p className="muted">No registered edges.</p>}</> : <p className="muted">Select a node to inspect its constitutional relationships.</p>}
    </aside>
  </div>;
}
