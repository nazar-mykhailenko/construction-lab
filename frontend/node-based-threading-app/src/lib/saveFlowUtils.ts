import { Edge, Node } from '@xyflow/react';

// Define flow data type for saving
export interface FlowExportData {
  nodes: Node[];
  edges: Edge[];
  version: string;
  timestamp: number;
}

// Function to download flow data as a JSON file
export function downloadFlowAsJson(nodes: Node[], edges: Edge[]) {
  const flowData: FlowExportData = {
    nodes,
    edges,
    version: '1.0.0', // You could track versions of your schema
    timestamp: Date.now()
  };

  // Convert to a JSON string
  const jsonString = JSON.stringify(flowData, null, 2);
  
  // Create a Blob with the JSON data
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element to trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = `flow-diagram-${new Date().toISOString().split('T')[0]}.json`;
  
  // Append to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}
