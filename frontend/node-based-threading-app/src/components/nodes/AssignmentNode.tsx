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
type AssignmentNode = Node<
  { leftVariable: string; rightVariable: string },
  "assignment"
>;

function AssignmentNode({ id, data }: NodeProps<AssignmentNode>) {
  const { updateNodeData, setNodes } = useReactFlow();
  const onLeftVariableChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(e.target.value);
      updateNodeData(id, { leftVariable: e.target.value });
    },
    [id, updateNodeData],
  );

  const onRightVariableChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(e.target.value);
      updateNodeData(id, { rightVariable: e.target.value });
    },
    [id, updateNodeData],
  );

  const handleReset = useCallback(() => {
    console.log("reset" + id);
    updateNodeData(id, { leftVariable: "", rightVariable: "" });
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
        <NodeHeaderTitle>Assignment</NodeHeaderTitle>
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
            value={data.leftVariable || ""}
            onChange={onLeftVariableChange}
            className={
              "nodrag rounded border bg-white px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
            }
          />
        </div>
        <div className="mb-1 self-end text-lg font-bold">=</div>
        <div className="flex w-full flex-col">
          <label className="mb-1 text-xs">Value</label>
          <Input
            value={data.rightVariable || ""}
            onChange={onRightVariableChange}
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

export default AssignmentNode;
