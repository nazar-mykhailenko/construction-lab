import { useCallback } from "react";
import { BaseNode } from "../base-node";
import { Input } from "../ui/input";
import { NodeProps, useReactFlow, Node, Handle, Position } from "@xyflow/react";

// Define the custom node type
type OutputNode = Node<{ variable: string }, "write">;

function OutputNode({ id, data, selected }: NodeProps<OutputNode>) {
  const { updateNodeData } = useReactFlow();

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(e.target.value);
      updateNodeData(id, { variable: e.target.value });
    },
    [id, updateNodeData],
  );

  const handleReset = useCallback(() => {
    console.log("reset" + id);
    updateNodeData(id, { variable: "" });
  }, [id, updateNodeData]);

  return (
    <BaseNode id={id} title="Output" onReset={handleReset} selected={selected}>
      <Handle type="target" position={Position.Top} />

      <Input
        value={data.variable}
        onChange={handleLabelChange}
        placeholder="variable name"
      />
      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
}

export default OutputNode;
