import { useFlowStore } from "@/hooks/useFlowStore";
import { importFlow } from "@/lib/flowUtils";
import { useReactFlow } from "@xyflow/react";
import { FileDown, FilePlus, FileText, Play, Save } from "lucide-react";
import { useRef, useState } from "react";
import { ClearFlowDialog } from "./ClearFlowDialog";
import { CodeBlockDialog } from "./CodeBlockDialog";
import DndSidebar from "./DndSidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

// Simple mock functions for demonstration
const handleTest = () => {
  alert("Функція тестування запущена");
};

const handleConvertToCode = () => {
  alert("Функція переведення в код запущена");
};

export function AppSidebar() {
  const { nodes, edges, setNodes, setEdges } = useFlowStore();
  const [showDialog, setShowDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setViewport, fitView } = useReactFlow();

  const handleSave = () => {
    if (nodes.length === 0) {
      alert("Немає вузлів для збереження!");
      return;
    }
    setShowDialog(true);
  };

  const handleCreate = () => {
    if (nodes.length === 0 && edges.length === 0) {
      alert("Діаграма вже порожня!");
      return;
    }
    setShowClearDialog(true);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importFlow(file, {
        setNodes,
        setEdges,
        setViewport,
        fitView,
      });
      
      // Close any open dialogs
      setShowDialog(false);
      setShowClearDialog(false);
    } catch (error) {
      alert('Failed to load diagram. Make sure the file is a valid flow diagram.');
    }

    // Reset the file input
    event.target.value = '';
  };

  // Define items within the component to access state functions
  const items = [
    {
      title: "Create",
      icon: FilePlus,
      onClick: handleCreate,
    },
    {
      title: "Import",
      icon: FileDown,
      onClick: handleImport,
    },
    {
      title: "Save",
      icon: Save,
      onClick: handleSave,
    },
    {
      title: "Test",
      icon: Play,
      onClick: handleTest,
    },
    {
      title: "Convert to Code",
      icon: FileText,
      onClick: handleConvertToCode,
    },
  ];

  return (
    <Sidebar className="h-screen overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".json"
        style={{ display: "none" }}
      />
      <SidebarContent className="flex h-full flex-col">
        <SidebarGroup className="flex-shrink-0">
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="flex w-full items-center gap-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="flex-grow overflow-hidden">
          <DndSidebar />
        </SidebarGroup>
      </SidebarContent>

      {showDialog && (
        <CodeBlockDialog
          nodes={nodes}
          edges={edges}
          open={showDialog}
          onOpenChange={setShowDialog}
        />
      )}

      <ClearFlowDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
      />
    </Sidebar>
  );
}
