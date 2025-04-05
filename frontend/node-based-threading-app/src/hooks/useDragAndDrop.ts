import { useDnD } from "@/lib/DnDContext";
import { nodeTypes } from "@/lib/nodeTypes";
import { Node, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

const getId = () => `node_${crypto.randomUUID()}`;

export function useDragAndDrop(setNodes: (updater: (nodes: Node[]) => Node[]) => void) {
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

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

      const nodeConfig = nodeTypes[type];
      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { ...nodeConfig.initialData },
      };

      setNodes((nds) => {
        const isGroup = type === "groupNode";
        const existingNodes = [...nds];
        
        if (isGroup) {
          return [newNode, ...existingNodes];
        } else {
          const groupNodes = existingNodes.filter(n => n.type === "groupNode");
          const childNodes = existingNodes.filter(n => n.parentId);
          const regularNodes = existingNodes.filter(
            n => !n.type?.includes("group") && !n.parentId
          );
          
          return [...groupNodes, ...regularNodes, newNode, ...childNodes];
        }
      });
    },
    [screenToFlowPosition, type, setNodes],
  );

  return {
    onDragOver,
    onDrop,
  };
}