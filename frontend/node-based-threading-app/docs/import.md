# Diagram Import Process

This document explains how the diagram import functionality works in the application.

## Overview
The diagram import feature allows users to load a previously saved diagram from a JSON file. The imported diagram is displayed in the application, replacing any existing nodes and edges.

## How It Works

### 1. User Interaction
- The user clicks the **Import** button in the sidebar.
- This triggers the `handleImport` function, which opens a file picker dialog for the user to select a `.json` file.

### 2. File Selection
- Once the user selects a file, the `handleFileSelect` function is called.
- The selected file is passed to the `importFlow` utility function for processing.

### 3. File Processing
The `importFlow` function performs the following steps:
1. **Read the File**: The file is read asynchronously using a `FileReader`.
2. **Parse JSON**: The file content is parsed into a JavaScript object.
3. **Validate Data**: The function checks if the parsed object contains valid `nodes` and `edges` arrays.
4. **Update State**:
   - Existing nodes and edges are cleared.
   - New nodes and edges from the file are added to the application's state using `setNodes` and `setEdges`.
5. **Adjust Viewport**:
   - The viewport is reset to its default position and zoom level.
   - After a short delay, the `fitView` method is called to ensure all nodes are visible.

### 4. Error Handling
- If the file is invalid or an error occurs during processing, the user is shown an error message: `Failed to load diagram. Make sure the file is a valid flow diagram.`

## JSON File Structure
The imported JSON file must have the following structure:

```json
{
  "nodes": [
    {
      "id": "unique_node_id",
      "type": "node_type",
      "position": { "x": 0, "y": 0 },
      "data": { "key": "value" },
      "measured": { "width": 100, "height": 100 },
      "selected": false,
      "dragging": false
    }
  ],
  "edges": [
    {
      "id": "unique_edge_id",
      "source": "source_node_id",
      "target": "target_node_id",
      "type": "edge_type",
      "animated": true
    }
  ],
  "version": "1.0.0",
  "timestamp": 1743846769866
}
```

### Nodes
- `id`: Unique identifier for the node.
- `type`: Type of the node (e.g., `read`, `write`, `condition`).
- `position`: Coordinates of the node on the canvas.
- `data`: Custom data associated with the node.
- `measured`: Dimensions of the node.
- `selected` and `dragging`: UI state of the node.

### Edges
- `id`: Unique identifier for the edge.
- `source`: ID of the source node.
- `target`: ID of the target node.
- `type`: Type of the edge (e.g., `step`).
- `animated`: Whether the edge is animated.

## Key Functions

### `handleImport`
- Opens the file picker dialog.

### `handleFileSelect`
- Reads the selected file and passes it to `importFlow`.

### `importFlow`
- Processes the file, validates its content, updates the state, and adjusts the viewport.

## Error Scenarios
- **Invalid File Format**: If the file does not contain valid `nodes` and `edges`, an error message is displayed.
- **File Read Error**: If the file cannot be read, the user is notified.

## Example
Here is an example of a valid JSON file:

```json
{
  "nodes": [
    {
      "id": "node_1",
      "type": "read",
      "position": { "x": 100, "y": 200 },
      "data": { "variable": "value1" },
      "measured": { "width": 200, "height": 100 },
      "selected": false,
      "dragging": false
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_1",
      "target": "node_2",
      "type": "step",
      "animated": true
    }
  ],
  "version": "1.0.0",
  "timestamp": 1743846769866
}
```

By following this structure, you can successfully import diagrams into the application.