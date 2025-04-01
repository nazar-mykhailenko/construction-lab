import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { downloadFlowAsJson } from "@/lib/saveFlowUtils";
import { Edge, Node } from "@xyflow/react";
import { useState } from "react";

interface CodeBlockDialogProps {
  nodes: Node[];
  edges: Edge[];
  buttonText?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  // Add new props for external control
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CodeBlockDialog({
  nodes,
  edges,
  buttonText = "Save",
  dialogTitle = "Your Flow JSON",
  dialogDescription = "Here is the JSON representation of your flow.",
  // Use these new props with defaults for backward compatibility
  open,
  onOpenChange,
}: CodeBlockDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Generate the JSON data for display
  const flowData = {
    nodes,
    edges,
    version: "1.0.0",
    timestamp: Date.now(),
  };

  const jsonString = JSON.stringify(flowData, null, 2);

  const handleDownload = () => {
    downloadFlowAsJson(nodes, edges);
    // Optionally close the dialog after download
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // If we're using the component with external control (open and onOpenChange props)
  if (onOpenChange !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 my-4 max-h-[60vh] overflow-auto rounded-md p-4">
            <pre className="text-sm">{jsonString}</pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleDownload} className="ml-2">
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise, we're using the component with its own internal trigger button

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{buttonText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="bg-muted/50 my-4 max-h-[60vh] overflow-auto rounded-md p-4">
          <pre className="text-sm">{jsonString}</pre>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)} // Close the dialog
          >
            Close
          </Button>
          <Button onClick={handleDownload} className="ml-2">
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
