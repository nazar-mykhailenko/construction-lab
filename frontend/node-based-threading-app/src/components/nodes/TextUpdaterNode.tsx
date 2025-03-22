import { cn } from "@/lib/utils";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { useCallback } from "react";

// Define the custom node type
type TextUpdaterNode = Node<{ text: string }, 'textUpdater'>;

function TextUpdaterNode({ data }: NodeProps<TextUpdaterNode>) {
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  }, []);

  return (
    <div
      className={cn(
        "p-3 rounded-md shadow-md border border-gray-200 bg-white",
        "transition-all duration-200"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500"
      />
      
      <div className="text-sm font-medium mb-2">Text Updater Node</div>
      
      <div className="flex flex-col space-y-2">
        <label htmlFor="text" className="text-xs text-gray-600">
          Text:
        </label>
        <input
          id="text"
          name="text"
          value={data.text || ""}
          onChange={onChange}
          className={cn(
            "nodrag border rounded px-2 py-1 text-sm bg-white",
            "focus:outline-none focus:ring-1 focus:ring-blue-500"
          )}
        />
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        className="w-3 h-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        className="w-3 h-3 bg-blue-500"
        style={{ left: 50 }}
      />
    </div>
  );
}

export default TextUpdaterNode;
