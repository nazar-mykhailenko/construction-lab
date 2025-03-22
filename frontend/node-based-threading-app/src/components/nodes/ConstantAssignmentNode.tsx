import { Handle, Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import {
  NodeHeader,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderMenuAction,
} from "../node-header";
import { Input } from "../ui/input";
import { DropdownMenuItem } from "../ui/dropdown-menu";

// Define the custom node type
type ConstantAssignmentNode = Node<
  { variable: string; constant: string },
  "constantAssignment"
>;

function ConstantAssignmentNode({
  id,
  data,
}: NodeProps<ConstantAssignmentNode>) {
  const { updateNodeData, setNodes } = useReactFlow();

  const onVariableChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(e.target.value);
      updateNodeData(id, { variable: e.target.value });
    },
    [id, updateNodeData],
  );

  const onConstantChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(e.target.value);
      updateNodeData(id, { constant: e.target.value });
    },
    [id, updateNodeData],
  );

  const handleReset = useCallback(() => {
    console.log("reset" + id);
    updateNodeData(id, { variable: "", constant: "" });
  }, [id, updateNodeData]);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  }, [id, setNodes]);

  return (
    <div className={"rounded-md border border-gray-200 bg-white p-3 shadow-md"}>
      <Handle
        type="target"
        position={Position.Top}
        className="h-3 w-3 bg-blue-500"
      />

      <NodeHeader>
        <NodeHeaderTitle>Constant Assignment</NodeHeaderTitle>
        <NodeHeaderActions>
          <NodeHeaderMenuAction label="Open node menu">
            <DropdownMenuItem onSelect={handleReset}>Reset</DropdownMenuItem>
            <DropdownMenuItem onSelect={handleDelete}>Delete</DropdownMenuItem>
          </NodeHeaderMenuAction>
        </NodeHeaderActions>
      </NodeHeader>

      <div className="flex items-center gap-2">
        <div className="flex w-full flex-col">
          <label className="mb-1 text-xs">Variable</label>
          <Input
            value={data.variable || ""}
            onChange={onVariableChange}
            className={"nodrag rounded border bg-white px-2 py-1 text-sm"}
          />
        </div>
        <div className="mb-1 self-end text-lg font-bold">=</div>
        <div className="flex w-full flex-col">
          <label className="mb-1 text-xs">Constant</label>
          <Input
            value={data.constant || ""}
            onChange={onConstantChange}
            className={"nodrag rounded border bg-white px-2 py-1 text-sm"}
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        className="h-3 w-3 bg-blue-500"
      />
    </div>
  );
}

export default ConstantAssignmentNode;
