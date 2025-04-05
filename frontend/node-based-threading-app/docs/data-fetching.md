# Data Fetching and API Communication

This document explains how data fetching and API communication work in the application, particularly focusing on the code generation process.

## Overview

The application communicates with a backend API to generate C# code from the flow diagram. The main interaction happens when the user clicks the "Convert to Code" button in the sidebar.

## API Endpoints

### Code Generation Endpoint
- **URL**: `http://localhost:5190/api/diagrams/generate`
- **Method**: POST
- **Purpose**: Converts flow diagram to C# code

## Request Format

The API expects an array containing a single object with `nodes` and `edges`:

```json
[
  {
    "nodes": [
      {
        "id": "string",
        "type": 0,
        "data": {
          "additionalProp1": "string",
          "additionalProp2": "string",
          "additionalProp3": "string"
        }
      }
    ],
    "edges": [
      {
        "id": "string",
        "source": "string",
        "target": "string",
        "sourceHandle": 0
      }
    ]
  }
]
```

### Node Properties
- `id`: Unique identifier for the node
- `type`: Numeric value representing the block type
- `data`: Additional properties specific to the node type

### Edge Properties
- `id`: Unique identifier for the edge
- `source`: ID of the source node
- `target`: ID of the target node
- `sourceHandle`: Numeric value representing the connection type

## Implementation Details

### Code Generation Service

The code generation service is implemented in `codeGenerationService.ts`:

```typescript
export async function generateCode(flowData: FlowData): Promise<string> {
  try {
    const response = await fetch('http://localhost:5190/api/diagrams/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        nodes: flowData.nodes,
        edges: flowData.edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: parseInt(edge.sourceHandle || "0")
        }))
      }])
    });

    if (!response.ok) {
      throw new Error('Failed to generate code');
    }

    return await response.text();
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
}
```

### Usage in Components

The code generation service is used in the `GeneratedCodeDialog` component when the dialog is opened:

1. The component starts in a loading state
2. It calls the `generateCode` function with the current nodes and edges
3. When the response is received, it displays the generated code with syntax highlighting
4. If an error occurs, it shows an error message

## Error Handling

The application handles several types of errors:

1. **Network Errors**: If the API is unreachable
2. **Server Errors**: If the API returns a non-200 status code
3. **Invalid Data**: If the response isn't in the expected format

Error messages are displayed to the user in the GeneratedCodeDialog.

## Data Flow

1. User clicks "Convert to Code" in the sidebar
2. The GeneratedCodeDialog opens and triggers the code generation
3. The current flow diagram (nodes and edges) is sent to the API
4. The API processes the diagram and generates C# code
5. The response is received and displayed in the dialog
6. Users can copy the generated code to clipboard

## Best Practices

1. **Error Handling**: Always catch and handle potential errors
2. **Loading States**: Show loading indicators during API calls
3. **Type Safety**: Use TypeScript interfaces to ensure correct data structure
4. **Response Validation**: Verify API responses before using them
5. **User Feedback**: Provide clear feedback for success and error cases

## Example Usage

```typescript
// Example of using the code generation service
const handleGenerateCode = async () => {
  try {
    const code = await generateCode({
      nodes: currentNodes,
      edges: currentEdges
    });
    console.log('Generated code:', code);
  } catch (error) {
    console.error('Failed to generate code:', error);
  }
};
```

This documentation should help developers understand how data fetching works in the application and how to properly use the code generation API.