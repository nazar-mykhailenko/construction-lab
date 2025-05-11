import { Handle, Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { BaseNode } from "../base-node";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Define the custom node type
type ConditionNode = Node<
  {
    variable: string;
    constant: string;
    operator: "==" | "<" | ">" | "<=" | ">=";
  },
  "condition"
>;

function ConditionNode({ id, data, selected }: NodeProps<ConditionNode>) {
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

  const onOperatorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      console.log(e.target.value);
      updateNodeData(id, {
        operator: e.target.value as ConditionNode["data"]["operator"],
      });
    },
    [id, updateNodeData],
  );

  const handleReset = useCallback(() => {
    console.log("reset" + id);
    updateNodeData(id, { variable: "", constant: "", operator: "==" });
  }, [id, updateNodeData]);

  return (
    <BaseNode
      id={id}
      title="Condition"
      onReset={handleReset}
      selected={selected}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="h-3 w-3 bg-blue-500"
      />

      <div className="flex items-center gap-2">
        <div className="flex w-full flex-col">
          <label className="mb-1 text-xs">Variable</label>
          <Input
            placeholder="variable name"
            value={data.variable || ""}
            onChange={onVariableChange}
            className={"nodrag rounded border bg-white px-2 py-1 text-sm"}
          />
        </div>

        <div className="flex flex-col">
          <Label className="mb-1 text-xs">Operator</Label>
          <Select
            value={data.operator}
            onValueChange={(value) => {
              onOperatorChange({
                target: { value },
              } as React.ChangeEvent<HTMLSelectElement>);
            }}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="Select a operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="==">==</SelectItem>
              <SelectItem value="<">&lt;</SelectItem>
              <SelectItem value=">">&gt;</SelectItem>
              <SelectItem value="<=">&lt;=</SelectItem>
              <SelectItem value=">=">&gt;=</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-full flex-col">
          <label className="mb-1 text-xs">Value</label>
          <Input
            placeholder="constant value"
            value={data.constant || ""}
            onChange={onConstantChange}
            className={"nodrag rounded border bg-white px-2 py-1 text-sm"}
          />
        </div>
      </div>
      <div className="flex w-full">
        <Handle
          type="source"
          position={Position.Right}
          id="true"
          style={{ backgroundColor: "green" }}
        />
        <Handle
          type="source"
          position={Position.Left}
          id="false"
          style={{ backgroundColor: "red" }}
        />
      </div>
    </BaseNode>
  );
}

export default ConditionNode;
