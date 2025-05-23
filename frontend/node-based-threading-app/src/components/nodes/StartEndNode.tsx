import { cn } from "@/lib/utils";
import {
  Handle,
  Node,
  NodeProps,
  Position,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import {
  NodeHeader,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderMenuAction,
} from "../node-header";
import { DropdownMenuItem } from "../ui/dropdown-menu";

// Define the custom node type
type StartEndNode = Node<{ type?: "start" | "end" }, "startEnd">;

function StartEndNode({ data, id }: NodeProps<StartEndNode>) {
  // Set default type to "start" if not provided
  const [type, setType] = useState(data.type || "start");
  const { getEdges, setEdges, deleteElements } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const handleDelete = useCallback(() => {
    deleteElements({ nodes: [{ id }] });
  }, [deleteElements, id]);

  const onReset = useCallback(() => {
    setType("start");
    data.type = "start";
  }, [data]);

  // Initialize data.type if it's not set
  if (!data.type) {
    data.type = "start";
  }

  const onTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value as "start" | "end";
      setType(newType);
      data.type = newType; // Update the node data as well

      // Remove all connections to/from this node
      const allEdges = getEdges();
      const filteredEdges = allEdges.filter(
        (edge) => edge.source !== id && edge.target !== id,
      );
      setEdges(filteredEdges);

      // Update node internals to reflect handle changes
      updateNodeInternals(id);
    },
    [data, id, getEdges, setEdges, updateNodeInternals],
  );

  return (
    <div
      className={cn(
        "rounded-md border-2 bg-white p-3 shadow-md",
        type === "start" ? "border-green-500" : "border-red-500",
      )}
    >
      {type === "start" && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="h-3 w-3 bg-blue-500"
        />
      )}

      {type === "end" && (
        <Handle
          type="target"
          position={Position.Top}
          className="h-3 w-3 bg-blue-500"
        />
      )}

      <NodeHeader>
        <NodeHeaderTitle>{type === "start" ? "Start" : "End"}</NodeHeaderTitle>
        <NodeHeaderActions>
          <NodeHeaderMenuAction label="Open node menu">
            <DropdownMenuItem onSelect={onReset}>Reset</DropdownMenuItem>
            <DropdownMenuItem onSelect={handleDelete}>Delete</DropdownMenuItem>
          </NodeHeaderMenuAction>
        </NodeHeaderActions>
      </NodeHeader>

      <div className="flex justify-center">
        <select
          value={type}
          onChange={onTypeChange}
          className={cn(
            "nodrag border-input h-9 rounded-md border bg-transparent px-3 py-1 text-sm",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          )}
        >
          <option value="start">Start</option>
          <option value="end">End</option>
        </select>
      </div>
    </div>
  );
}

export default StartEndNode;
