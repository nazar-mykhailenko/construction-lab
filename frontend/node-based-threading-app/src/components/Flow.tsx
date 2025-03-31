import { useFlowStore } from "@/hooks/useFlowStore";
import { useDnD } from "@/lib/DnDContext";
import { getNodeTypesMap, nodeTypes } from "@/lib/nodeTypes";
import {
  Background,
  Controls,
  Edge,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

const defaulEdgeOptions = {
  animated: true,
  type: "step",
};

interface FlowWrapperProps {
  children: ReactNode;
  className?: string;
}

function FlowWrapper({ children, className }: FlowWrapperProps) {
  return (
    <div className={`h-full min-h-[500px] w-full ${className || ""}`}>
      {children}
    </div>
  );
}

const getId = () => `node_${crypto.randomUUID()}`;

export function Flow() {
  // Use the centralized node types map
  const nodeTypesMap = useMemo(() => getNodeTypesMap(), []);

  // Get stored nodes and edges from Zustand
  const {
    nodes: storedNodes,
    edges: storedEdges,
    setNodes: storeSetNodes,
    setEdges: storeSetEdges,
  } = useFlowStore();

  // Initialize local state from the store
  const [nodes, setNodes] = useState<Node[]>(storedNodes);
  const [edges, setEdges] = useState<Edge[]>(storedEdges);

  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  // Sync with global store when local state changes
  useEffect(() => {
    // Only update the store if the local state is different
    if (JSON.stringify(nodes) !== JSON.stringify(storedNodes)) {
      storeSetNodes(nodes);
    }
  }, [nodes, storeSetNodes, storedNodes]);

  useEffect(() => {
    // Only update the store if the local state is different
    if (JSON.stringify(edges) !== JSON.stringify(storedEdges)) {
      storeSetEdges(edges);
    }
  }, [edges, storeSetEdges, storedEdges]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!type || !nodeTypes[type]) {
        console.warn(
          "Node type is not set in DnD context or not found in configuration",
        );
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Get default data from the node type configuration
      const nodeConfig = nodeTypes[type];

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { ...nodeConfig.initialData },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type],
  );

  return (
    <FlowWrapper>
      <ReactFlow
        nodeTypes={nodeTypesMap}
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        panOnScroll
        selectionOnDrag
        defaultEdgeOptions={defaulEdgeOptions}
        className="h-full w-full"
        fitView
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </FlowWrapper>
  );
}
