import { forwardRef, HTMLAttributes, useCallback } from "react";

import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import {
  NodeHeader,
  NodeHeaderActions,
  NodeHeaderMenuAction,
  NodeHeaderTitle,
} from "./node-header";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export const BaseNode = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    selected?: boolean;
    id: string;
    onReset?: () => void;
    title: string;
    headerActions?: React.ReactNode;
  }
>(
  (
    {
      className,
      selected,
      id,
      title,
      onReset,
      children,
      headerActions,
      ...props
    },
    ref,
  ) => {
    const { deleteElements, getNode, setNodes } = useReactFlow();

    const handleDelete = useCallback(() => {
      deleteElements({ nodes: [{ id }] });
    }, [deleteElements, id]);

    const handleDetach = useCallback(() => {
      const node = getNode(id);
      if (!node?.parentId) return;

      setNodes((nodes) => {
        return nodes.map((childNode) => {
          if (childNode.id === id) {
            // Find parent node to get its position
            const parentNode = nodes.find(pn => pn.id === node.parentId);
            if (!parentNode) return childNode;

            // Create a copy without parentId and extent
            const { parentId: _parentId, extent: _extent, ...rest } = childNode;
            const width = childNode.measured?.width|| 0;
            const height = childNode.measured?.height || 0;
            
            // Set position to parent's position minus child width
            return {
              ...rest,
              position: {
                x: parentNode.position.x - width,
                y: parentNode.position.y - height,
              },
            };
          }
          return childNode;
        });
      });
    }, [id, getNode, setNodes]);

    const node = getNode(id);
    const hasParent = node?.parentId != null;

    return (
      <div
        ref={ref}
        className={cn(
          "bg-card text-card-foreground relative rounded-md border p-3",
          className,
          selected ? "border-muted-foreground shadow-lg" : "",
          "hover:ring-1",
        )}
        tabIndex={0}
        {...props}
      >
        <NodeHeader>
          <NodeHeaderTitle>{title}</NodeHeaderTitle>
          <NodeHeaderActions>
            {headerActions}
            <NodeHeaderMenuAction label="Open node menu">
              {onReset && (
                <DropdownMenuItem onSelect={onReset}>Reset</DropdownMenuItem>
              )}
              {hasParent && (
                <DropdownMenuItem onSelect={handleDetach}>Detach</DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={handleDelete}>Delete</DropdownMenuItem>
            </NodeHeaderMenuAction>
          </NodeHeaderActions>
        </NodeHeader>
        {children}
      </div>
    );
  },
);

BaseNode.displayName = "BaseNode";
