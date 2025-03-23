import { createContext, ReactNode, useContext, useState } from 'react';
import { nodeTypes } from './nodeTypes';

// Define the type for node types (keys of the nodeTypes object)
export type NodeType = keyof typeof nodeTypes | null;

// Create a context with proper typing
type DnDContextType = [NodeType, (type: NodeType) => void];

const DnDContext = createContext<DnDContextType | undefined>(undefined);

interface DnDProviderProps {
  children: ReactNode;
}

export function DnDProvider({ children }: DnDProviderProps) {
  const [type, setType] = useState<NodeType>(null);
  
  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
}

export function useDnD(): DnDContextType {
  const context = useContext(DnDContext);
  if (context === undefined) {
    throw new Error('useDnD must be used within a DnDProvider');
  }
  return context;
}
