import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import { useCallback } from "react"

const handleStyle = { left: 10 }

type TextUpdaterNode = Node<{ text: string }, 'textUpdater'>;

const TextUpdaterNode = ({ data }: NodeProps<TextUpdaterNode>) => {

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
  }, [])

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="bg-blue-300">
        <label htmlFor="text">Text:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag"
          value={data.text}
        />
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={handleStyle}
      />
    </>
  )
}

export default TextUpdaterNode
