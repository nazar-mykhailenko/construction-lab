import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useGroupNodes } from "@/hooks/useGroupNodes";
import { useNodeManagement } from "@/hooks/useNodeManagement";
import { getNodeTypesMap } from "@/lib/nodeTypes";
import { Background, Connection, Controls, Edge, IsValidConnection, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ReactNode, useCallback, useMemo } from "react";

const defaultEdgeOptions = {
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

export function Flow() {
  const nodeTypesMap = useMemo(() => getNodeTypesMap(), []);
  const {
    nodes,
    edges,
    setNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useNodeManagement();

  const { onDragOver, onDrop } = useDragAndDrop(setNodes);
  const { onNodeDrag } = useGroupNodes(setNodes);

  // Validate connection - check if source handle already has a connection
  const isValidConnection: IsValidConnection = useCallback(
    (connection: Connection | Edge) => {
      // If there's no source, we can't validate properly
      if (!connection.source) {
        console.log("Cannot validate - missing source node:", connection);
        return false;
      }
      
      // For nodes that don't specify a sourceHandle (null sourceHandle),
      // we still want to limit connections to one per node
      const sourceKey = connection.source;
      const handleKey = connection.sourceHandle !== null ? connection.sourceHandle : 'default';
      
      console.log(`Validating connection from ${sourceKey}:${handleKey} to ${connection.target}`);
      
      // Check if this source (and optionally handle) already has a connection
      const hasExistingConnection = edges.some(edge => {
        const edgeSourceKey = edge.source;
        const edgeHandleKey = edge.sourceHandle !== null ? edge.sourceHandle : 'default';
        
        const isSameSource = edgeSourceKey === sourceKey;
        const isSameHandle = connection.sourceHandle === null || edgeHandleKey === handleKey;
        
        return isSameSource && isSameHandle;
      });
      
      if (hasExistingConnection) {
        console.log(`🚫 Source ${sourceKey}:${handleKey} already has a connection`);
        return false;
      }
      
      return true;
    },
    [edges]
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
        onNodeDrag={onNodeDrag}
        panOnScroll
        selectionOnDrag
        defaultEdgeOptions={defaultEdgeOptions}
        className="h-full w-full"
        fitView
        onDrop={onDrop}
        onDragOver={onDragOver}
        isValidConnection={isValidConnection}
        connectionRadius={40}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </FlowWrapper>
  );
}
