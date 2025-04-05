import { Node, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

export function useGroupNodes(setNodes: (updater: (nodes: Node[]) => Node[]) => void) {
  const { getIntersectingNodes } = useReactFlow();

  const onNodeDrag = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === "groupNode") return;

      const intersections = getIntersectingNodes(node, false);
      const groupNodes = intersections.filter((n) => n.type === "groupNode");

      if (groupNodes.length > 0) {
        const groupNode = groupNodes[0];
        if (node.parentId !== groupNode.id) {
          setNodes((nds) => {
            const updatedNodes = nds.map((n) => {
              if (n.id === node.id) {
                return {
                  ...n,
                  parentId: groupNode.id,
                  extent: "parent" as const,
                  position: {
                    x: node.position.x - groupNode.position.x,
                    y: node.position.y - groupNode.position.y,
                  },
                };
              }
              return n;
            });

            const parentNodes = updatedNodes.filter((n) => !n.parentId);
            const childNodes = updatedNodes.filter((n) => n.parentId);

            return [...parentNodes, ...childNodes];
          });
        }
      } else if (node.parentId) {
        setNodes((nds) => {
          const updatedNodes = nds.map((n) => {
            if (n.id === node.id) {
              const parentNode = nds.find((pn) => pn.id === node.parentId);
              if (!parentNode) return n;

              const rest = { ...n };
              delete rest.parentId;
              delete rest.extent;

              return {
                ...rest,
                position: {
                  x: node.position.x + parentNode.position.x,
                  y: node.position.y + parentNode.position.y,
                },
              };
            }
            return n;
          });

          const parentNodes = updatedNodes.filter((n) => !n.parentId);
          const childNodes = updatedNodes.filter((n) => n.parentId);

          return [...parentNodes, ...childNodes];
        });
      }
    },
    [getIntersectingNodes, setNodes],
  );

  return {
    onNodeDrag,
  };
}