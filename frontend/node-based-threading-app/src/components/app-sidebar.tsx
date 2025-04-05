import { useFlowStore } from "@/hooks/useFlowStore";
import { FileDown, FilePlus, FileText, Play, Save } from "lucide-react";
import { useState } from "react";
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
const handleImport = () => {
  alert("Функція імпорту запущена");
};

const handleTest = () => {
  alert("Функція тестування запущена");
};

const handleConvertToCode = () => {
  alert("Функція переведення в код запущена");
};

// We'll update the items in the component where we have access to state

export function AppSidebar() {
  // Get nodes and edges from our store
  const { nodes, edges } = useFlowStore();
  const [showDialog, setShowDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Handler for the save button
  const handleSave = () => {
    if (nodes.length === 0) {
      alert("Немає вузлів для збереження!");
      return;
    }

    // Show the dialog instead of downloading directly
    setShowDialog(true);
  };

  // Handler for the create (clear) button
  const handleCreate = () => {
    if (nodes.length === 0 && edges.length === 0) {
      alert("Діаграма вже порожня!");
      return;
    }

    // Show the confirmation dialog
    setShowClearDialog(true);
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
      <SidebarContent className="flex h-full flex-col">
        <SidebarGroup className="flex-shrink-0">
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Map all items including Create and Save */}
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

      {/* Save dialog */}
      {showDialog && (
        <CodeBlockDialog
          nodes={nodes}
          edges={edges}
          open={showDialog}
          onOpenChange={setShowDialog}
        />
      )}

      {/* Clear diagram confirmation dialog - now using the separate component */}
      <ClearFlowDialog 
        open={showClearDialog} 
        onOpenChange={setShowClearDialog} 
      />
    </Sidebar>
  );
}
