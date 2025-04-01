import { Handle, Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { BaseNode } from "../base-node";
import { Input } from "../ui/input";

// Define the custom node type
type InputNode = Node<{ variable: string }, "read">;

function InputNode({ id, data }: NodeProps<InputNode>) {
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
        <BaseNode id={id} title="Input" onReset={handleReset}>
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

export default InputNode;
