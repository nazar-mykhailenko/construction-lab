import { createFileRoute } from "@tanstack/react-router";
import "@xyflow/react/dist/style.css";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DnDProvider } from "@/lib/DnDContext";
import { ReactFlowProvider } from "@xyflow/react";
import { Flow } from "../components/Flow";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <ReactFlowProvider>
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
                  <Flow />
                </div>
              </div>
            </div>
          </div>
        </DnDProvider>
      </SidebarProvider>
    </ReactFlowProvider>
  );
}
