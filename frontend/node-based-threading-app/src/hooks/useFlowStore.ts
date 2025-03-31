import { Edge, Node } from '@xyflow/react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FlowState = {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  resetFlow: () => void;
};

export const useFlowStore = create<FlowState>()(
  persist(
    (set) => ({
      nodes: [],
      edges: [],
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      resetFlow: () => set({ nodes: [], edges: [] })
    }),
    {
      name: 'flow-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
