import { useFlowStore } from "@/hooks/useFlowStore";
import { FileDown, FilePlus, FileText, Play, Save } from "lucide-react";
import { useState } from "react";
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
const handleCreate = () => {
  alert("Функція створення запущена");
};

const handleImport = () => {
  alert("Функція імпорту запущена");
};

const handleTest = () => {
  alert("Функція тестування запущена");
};

const handleConvertToCode = () => {
  alert("Функція переведення в код запущена");
};

// We'll replace the handleSave function with a proper implementation in the component

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
  // We'll handle the Save button separately
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

export function AppSidebar() {
  // Get nodes and edges from our store
  const { nodes, edges } = useFlowStore();
  const [showDialog, setShowDialog] = useState(false);

  // Handler for the save button
  const handleSave = () => {
    if (nodes.length === 0) {
      alert("Немає вузлів для збереження!");
      return;
    }

    // Show the dialog instead of downloading directly
    setShowDialog(true);
  };

  return (
    <Sidebar className="h-screen overflow-hidden">
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
              {/* Add the save button separately because it uses the component's scope */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex w-full items-center gap-2"
                  >
                    <Save />
                    <span>Зберегти</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="flex-grow overflow-hidden">
          <DndSidebar />
        </SidebarGroup>
      </SidebarContent>

      {/* Add the dialog component */}
      {showDialog && (
        <CodeBlockDialog
          nodes={nodes}
          edges={edges}
          // dialogTitle="Зберегти Flow-діаграму"
          // dialogDescription="JSON-представлення вашої Flow-діаграми"
          open={showDialog}
          onOpenChange={setShowDialog}
        />
      )}
    </Sidebar>
  );
}
