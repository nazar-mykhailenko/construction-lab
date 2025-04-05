import { Edge, Node, OnConnect, OnEdgesChange, OnNodesChange, addEdge, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { useCallback } from "react";
import { useFlowStore } from "./useFlowStore";

export type NodeSetter = (updater: (nodes: Node[]) => Node[]) => void;
export type EdgeSetter = (updater: (edges: Edge[]) => Edge[]) => void;

export function useNodeManagement() {
  const {
    nodes: storedNodes,
    edges: storedEdges,
    setNodes: rawSetNodes,
    setEdges: rawSetEdges,
  } = useFlowStore();

  // Convert the raw setters to the correct type
  const setNodes: NodeSetter = useCallback(
    (updater) => rawSetNodes(updater(storedNodes)),
    [rawSetNodes, storedNodes]
  );

  const setEdges: EdgeSetter = useCallback(
    (updater) => rawSetEdges(updater(storedEdges)),
    [rawSetEdges, storedEdges]
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes(() => applyNodeChanges(changes, storedNodes));
    },
    [setNodes, storedNodes],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges(() => applyEdgeChanges(changes, storedEdges));
    },
    [setEdges, storedEdges],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges(() => addEdge(connection, storedEdges));
    },
    [setEdges, storedEdges],
  );

  return {
    nodes: storedNodes,
    edges: storedEdges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  };
}