import { forwardRef, HTMLAttributes, useCallback } from "react";

import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import {
  NodeHeader,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderMenuAction,
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
    const { deleteElements } = useReactFlow();

    const handleDelete = useCallback(() => {
      deleteElements({ nodes: [{ id }] });
    }, [deleteElements, id]);
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
              <DropdownMenuItem onSelect={handleDelete}>
                Delete
              </DropdownMenuItem>
            </NodeHeaderMenuAction>
          </NodeHeaderActions>
        </NodeHeader>
        {children}
      </div>
    );
  },
);

BaseNode.displayName = "BaseNode";
