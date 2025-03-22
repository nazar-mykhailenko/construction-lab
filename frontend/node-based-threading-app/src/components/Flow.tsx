import {
    Background,
    Controls,
    Edge,
    OnConnect,
    OnEdgesChange,
    OnNodesChange,
    ReactFlow,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useState } from "react";
import AssignmentNode from "./nodes/AssignmentNode";
import ConditionNode from "./nodes/ConditionNode";
import ConstantAssignmentNode from "./nodes/ConstantAssignmentNode";
import StartEndNode from "./nodes/StartEndNode";
import TextUpdaterNode from "./nodes/TextUpdaterNode";
import InputNode from "./nodes/InputNode";
import OutputNode from "./nodes/OutputNode";

const defaulEdgeOptions = {
    animated: true,
    type: "step",
};

const initialNodes: Node[] = [
    {
        id: "1",
        position: { x: 250, y: 50 },
        data: {},
        type: "startEnd",
    },
    {
        id: "3",
        position: { x: 100, y: 250 },
        data: { variable: "counter", constant: "0" },
        type: "constantAssignment",
    },
    {
        id: "4",
        position: { x: 400, y: 150 },
        data: {},
        type: "condition",
    },
    {
        id: "6",
        position: { x: 600, y: 250 },
        data: {},
        type: "assignment",
    },
    {
        id: "7",
        position: { x: 600, y: 350 },
        data: { type: "end" },
        type: "startEnd",
    },
    {
        id: "9",
        position: { x: 900, y: 350 },
        data: { lable: "custom" },
        type: "read",
    },
    {
        id: "10",
        position: { x: 900, y: 500 },
        data: { lable: "custom" },
        type: "write",
    },
];

const initialEdges: Edge[] = [
    // { id: "e1-2", source: "1", target: "2", animated: true, type: "step" },
    // { id: "e2-3", source: "2", target: "3", animated: true, type: "step" },
    // { id: "e3-4", source: "3", target: "4", animated: true, type: "step" },
    // {
    //     id: "e4-5",
    //     source: "4",
    //     target: "5",
    //     sourceHandle: "true",
    //     animated: true,
    //     type: "step",
    // },
    // {
    //     id: "e4-6",
    //     source: "4",
    //     target: "6",
    //     sourceHandle: "false",
    //     animated: true,
    //     type: "step",
    // },
    // { id: "e5-7", source: "5", target: "7", animated: true, type: "step" },
    // { id: "e6-7", source: "6", target: "7", animated: true, type: "step" },
];

export function Flow() {
    const nodeTypes = useMemo(
        () => ({
            textUpdater: TextUpdaterNode,
            assignment: AssignmentNode,
            constantAssignment: ConstantAssignmentNode,
            condition: ConditionNode,
            startEnd: StartEndNode,
            read: InputNode,
            write: OutputNode,
        }),
        [],
    );

    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );
    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges],
    );

    return (
        <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes}
            onNodesChange={onNodesChange}
            edges={edges}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            panOnScroll
            selectionOnDrag
            defaultEdgeOptions={defaulEdgeOptions}
        >
            <Background />
            <Controls />
        </ReactFlow>
    );
}
