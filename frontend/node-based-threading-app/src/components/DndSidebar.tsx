import { useDnD } from "@/lib/DnDContext";
import { getDraggableNodeTypes } from "@/lib/nodeTypes";
import React from "react";
import { SidebarGroupLabel } from "./ui/sidebar";

const Sidebar = () => {
  const [, setType] = useDnD();
  const draggableNodeTypes = getDraggableNodeTypes();

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
  ) => {
    console.log("Dragging node type:", nodeType);
    setType(nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex flex-col h-full">
      <SidebarGroupLabel className="flex-shrink-0"> Node Types</SidebarGroupLabel>
      <div className="overflow-y-auto flex-grow pr-2">
        {draggableNodeTypes.map((nodeConfig) => (
          <div
            key={nodeConfig.type}
            className={nodeConfig.sidebarConfig.className}
            onDragStart={(event) => onDragStart(event, nodeConfig.type)}
            draggable
          >
            {nodeConfig.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
