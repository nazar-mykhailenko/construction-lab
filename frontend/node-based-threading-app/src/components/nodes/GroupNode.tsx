import { cn } from "@/lib/utils";
import { Node, NodeProps, NodeResizer } from "@xyflow/react";

type GroupNodeData = Node<{}, "groupNode">;

function GroupNode({ selected, id }: NodeProps<GroupNodeData>) {
  return (
    <div className="relative min-h-[200px] min-w-[500px] w-full h-full">
      <NodeResizer
        color="gray"
        isVisible={selected}
        minWidth={500}
        minHeight={200}
      />
      <div
        className={cn(
          "absolute inset-0",
          "rounded-lg border-2 border-dashed",
          "transition-colors duration-200",
          selected
            ? "border-primary bg-gray-500/20"
            : "border-border bg-gray-500/10",
        )}
      />
    </div>
  );
}

export default GroupNode;
