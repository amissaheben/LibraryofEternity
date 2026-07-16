import GraphExplorer from "@/components/GraphExplorer";
import { getGraph } from "@/lib/library";

export default function GraphPage() {
  const graph = getGraph();
  return <div className="page-wrap graph-page"><header className="page-header"><span className="eyebrow">Topology</span><h1>Dependency Explorer</h1><p>{graph.nodes.length} nodes and {graph.edges.length} directed constitutional relationships.</p></header><GraphExplorer nodes={graph.nodes} edges={graph.edges}/></div>;
}
