import { ReactFlow, Controls, Background, applyEdgeChanges, applyNodeChanges, addEdge, type Node, Edge, OnConnect, OnEdgesChange, OnNodesChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useMemo, useState } from 'react';
import TextUpdaterNode from './nodes/TextUpdaterNode';


const initialNodes: Node[] = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'Node 1' } },
  { id: '2', position: { x: 100, y: 150 }, data: { label: 'Node 2' } },
  { id: '3', position: { x: 400, y: 150 }, data: { label: 'Node 3' } },
  { id: '4', position: { x: 500, y: 150 }, data: { label: 'Node 4', text: "text" }, type: "textUpdater" },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, type: "step" },
  { id: 'e1-3', source: '1', target: '3', animated: true, type: "step" },
];



export function Flow() {
  const nodeTypes = useMemo(() => ({ textUpdater: TextUpdaterNode }), []);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      onNodesChange={onNodesChange}
      edges={edges}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      panOnScroll
      selectionOnDrag>
      <Background />
      <Controls />
    </ReactFlow>
  );
}
