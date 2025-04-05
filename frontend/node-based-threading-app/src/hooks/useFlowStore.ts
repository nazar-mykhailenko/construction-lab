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

// Create the store with persist middleware
export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      setNodes: (nodes) => {
        // Ensure we're not setting the same nodes
        if (JSON.stringify(nodes) !== JSON.stringify(get().nodes)) {
          set({ nodes: [...nodes] });
        }
      },
      setEdges: (edges) => {
        // Ensure we're not setting the same edges
        if (JSON.stringify(edges) !== JSON.stringify(get().edges)) {
          set({ edges: [...edges] });
        }
      },
      resetFlow: () => set({ nodes: [], edges: [] }),
    }),
    {
      name: 'flow-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
    }
  )
);
