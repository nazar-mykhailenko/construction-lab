import { createFileRoute } from "@tanstack/react-router";
import "@xyflow/react/dist/style.css";

import { Flow } from "../components/Flow";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ReactFlowProvider } from "@xyflow/react";
import { DnDProvider } from "@/lib/DnDContext";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <SidebarProvider>
      <DnDProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <div className="flex-shrink-0">
            <AppSidebar />
          </div>
          <div className="relative flex flex-1">
            {/* Flow area */}
            <div className="relative flex-1">
              <div className="absolute top-2 left-2 z-20">
                <SidebarTrigger />
              </div>
              <div className="h-full w-full">
                <ReactFlowProvider>
                  <Flow />
                </ReactFlowProvider>
              </div>
            </div>
          </div>
        </div>
      </DnDProvider>
    </SidebarProvider>
  );
}
