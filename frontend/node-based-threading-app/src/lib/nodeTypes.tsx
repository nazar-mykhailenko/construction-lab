import AssignmentNode from "@/components/nodes/AssignmentNode";
import ConditionNode from "@/components/nodes/ConditionNode";
import ConstantAssignmentNode from "@/components/nodes/ConstantAssignmentNode";
import InputNode from "@/components/nodes/InputNode";
import OutputNode from "@/components/nodes/OutputNode";
import StartEndNode from "@/components/nodes/StartEndNode";
import TextUpdaterNode from "@/components/nodes/TextUpdaterNode";

export interface NodeTypeConfig {
  type: string;
  label: string;
  component: React.ComponentType<any>;
  initialData?: Record<string, any>;
  sidebarConfig: {
    className: string;
    isDraggable?: boolean;
  };
}

export const nodeTypes: Record<string, NodeTypeConfig> = {
  read: {
    type: "read",
    label: "Input Node",
    component: InputNode,
    initialData: { variable: "" },
    sidebarConfig: {
      className: "dndnode input mb-3 cursor-move rounded-md border border-blue-200 bg-blue-100 p-3 shadow-sm transition-transform hover:scale-102",
      isDraggable: true,
    },
  },
  write: {
    type: "write",
    label: "Output Node",
    component: OutputNode,
    initialData: { variable: "" },
    sidebarConfig: {
      className: "dndnode output mb-3 cursor-move rounded-md border border-green-200 bg-green-100 p-3 shadow-sm transition-transform hover:scale-102",
      isDraggable: true,
    },
  },
  textUpdater: {
    type: "textUpdater",
    label: "Text Node",
    component: TextUpdaterNode,
    initialData: { label: "Text Node" },
    sidebarConfig: {
      className: "dndnode mb-3 cursor-move rounded-md border border-gray-200 bg-gray-100 p-3 shadow-sm transition-transform hover:scale-102",
      isDraggable: true,
    },
  },
  assignment: {
    type: "assignment",
    label: "Assignment Node",
    component: AssignmentNode,
    initialData: {},
    sidebarConfig: {
      className: "dndnode mb-3 cursor-move rounded-md border border-purple-200 bg-purple-100 p-3 shadow-sm transition-transform hover:scale-102",
      isDraggable: true,
    },
  },
  constantAssignment: {
    type: "constantAssignment",
    label: "Constant Assignment",
    component: ConstantAssignmentNode,
    initialData: { variable: "", constant: "" },
    sidebarConfig: {
      className: "dndnode mb-3 cursor-move rounded-md border border-yellow-200 bg-yellow-100 p-3 shadow-sm transition-transform hover:scale-102",
      isDraggable: true,
    },
  },
  condition: {
    type: "condition",
    label: "Condition Node",
    component: ConditionNode,
    initialData: {},
    sidebarConfig: {
      className: "dndnode mb-3 cursor-move rounded-md border border-orange-200 bg-orange-100 p-3 shadow-sm transition-transform hover:scale-102",
      isDraggable: true,
    },
  },
  startEnd: {
    type: "startEnd",
    label: "Start/End Node",
    component: StartEndNode,
    initialData: {},
    sidebarConfig: {
      className: "dndnode mb-3 cursor-move rounded-md border border-red-200 bg-red-100 p-3 shadow-sm transition-transform hover:scale-102",
      isDraggable: true,
    },
  },
};

// Helper function to get the node types map for ReactFlow
export const getNodeTypesMap = () => {
  const typesMap: Record<string, React.ComponentType<any>> = {};
  
  Object.values(nodeTypes).forEach((config) => {
    typesMap[config.type] = config.component;
  });
  
  return typesMap;
};

// Helper to get draggable node types for sidebar
export const getDraggableNodeTypes = () => {
  return Object.values(nodeTypes).filter(
    (config) => config.sidebarConfig.isDraggable !== false
  );
};
