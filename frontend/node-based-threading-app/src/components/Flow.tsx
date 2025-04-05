import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useGroupNodes } from "@/hooks/useGroupNodes";
import { useNodeManagement } from "@/hooks/useNodeManagement";
import { getNodeTypesMap } from "@/lib/nodeTypes";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ReactNode, useMemo } from "react";

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
      >
        <Background />
        <Controls />
      </ReactFlow>
    </FlowWrapper>
  );
}
