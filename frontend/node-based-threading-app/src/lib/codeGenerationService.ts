import { Edge, Node } from "@xyflow/react";

interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

export async function generateCode(flowData: FlowData): Promise<string> {
  const body = convertFlowDataToJSON(flowData);

  console.log("Request body:", body); // Log the request body for debugging

  try {
    const response = await fetch(
      "http://localhost:5190/api/diagrams/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to generate code");
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Error generating code:", error);
    throw error;
  }
}

function convertFlowDataToJSON(flowData: FlowData) {
  return JSON.stringify([
    {
      nodes: flowData.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        data: node.data,
        parentId: node.parentId,
      })),
      edges: flowData.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
      })),
    },
  ]);
}
