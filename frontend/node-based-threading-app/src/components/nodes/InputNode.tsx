import { Handle, Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { BaseNode } from "../base-node";
import {
    NodeHeader,
    NodeHeaderActions,
    NodeHeaderMenuAction,
    NodeHeaderTitle,
} from "../node-header";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { Input } from "../ui/input";

// Define the custom node type
type InputNode = Node<{ variable: string }, "read">;

function InputNode({ id, data }: NodeProps<InputNode>) {
    const { updateNodeData, setNodes } = useReactFlow();

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

    const handleDelete = useCallback(() => {
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
    }, [id, setNodes]);

    return (
        <BaseNode>
            <Handle type="target" position={Position.Top} />

            <NodeHeader>
                <NodeHeaderTitle>Input</NodeHeaderTitle>
                <NodeHeaderActions>
                    <NodeHeaderMenuAction label="Open node menu">
                        <DropdownMenuItem onSelect={handleReset}>Reset</DropdownMenuItem>
                        <DropdownMenuItem onSelect={handleDelete}>Delete</DropdownMenuItem>
                    </NodeHeaderMenuAction>
                </NodeHeaderActions>
            </NodeHeader>

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
