import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { Input } from "../ui/input";
import { BaseNode } from "../base-node";
import { BaseHandle } from "../base-handle";

// Define the custom node type
type ConstantAssignmentNode = Node<
  { variable: string; constant: string },
  "constantAssignment"
>;

function ConstantAssignmentNode({
  id,
  data,
  selected,
}: NodeProps<ConstantAssignmentNode>) {
  const { updateNodeData } = useReactFlow();

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

  return (
    <BaseNode
      id={id}
      title="Constant Assignment"
      onReset={handleReset}
      selected={selected}
    >
      <BaseHandle type="target" position={Position.Top} />

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

      <BaseHandle type="source" position={Position.Bottom} />
    </BaseNode>
  );
}

export default ConstantAssignmentNode;
