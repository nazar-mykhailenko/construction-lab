import { Edge, Node, ReactFlowInstance } from "@xyflow/react";

export async function importFlow(
  file: File,
  {
    setNodes,
    setEdges,
    setViewport,
    fitView,
  }: {
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    setViewport: ReactFlowInstance["setViewport"];
    fitView: ReactFlowInstance["fitView"];
  }
) {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const flowData = JSON.parse(content);

        if (flowData.nodes && flowData.edges) {
          // First clear existing nodes and edges
          setNodes([]);
          setEdges([]);

          // Set the new nodes and edges
          setNodes(flowData.nodes);
          setEdges(flowData.edges);
          
          // Reset view and fit content
          setViewport({ x: 0, y: 0, zoom: 1 });
          
          // Use setTimeout to ensure the nodes are rendered before fitting
          setTimeout(() => {
            fitView({ padding: 0.2 });
          }, 50);

          resolve();
        } else {
          reject(new Error('Invalid file format'));
        }
      } catch (error) {
        console.error('Failed to load diagram:', error);
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}