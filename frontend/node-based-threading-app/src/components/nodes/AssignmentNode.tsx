import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { Input } from "../ui/input";
import { BaseHandle } from "../base-handle";
import { BaseNode } from "../base-node";

// Define the custom node type
type AssignmentNode = Node<
  { leftVariable: string; rightVariable: string },
  "assignment"
>;

function AssignmentNode({ id, data, selected }: NodeProps<AssignmentNode>) {
  const { updateNodeData } = useReactFlow();
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

  return (
    <BaseNode
      id={id}
      title="Assignment"
      onReset={handleReset}
      selected={selected}
    >
      <BaseHandle type="target" position={Position.Top} />

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
      <BaseHandle type="source" position={Position.Bottom} />
    </BaseNode>
  );
}

export default AssignmentNode;
