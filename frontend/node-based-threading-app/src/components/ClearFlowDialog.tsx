import { useFlowStore } from "@/hooks/useFlowStore";
import { useReactFlow } from "@xyflow/react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";

interface ClearFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClearFlowDialog({ open, onOpenChange }: ClearFlowDialogProps) {
  // Access the store and ReactFlow functions
  const { nodes, edges, resetFlow } = useFlowStore();
  const { deleteElements } = useReactFlow();

  const handleClearConfirm = () => {
    // Use deleteElements to remove all nodes and edges from ReactFlow
    deleteElements({
      nodes: nodes,
      edges: edges,
    });

    // Use resetFlow to clear the Zustand store
    resetFlow();

    // Close the dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear Diagram</DialogTitle>
          <DialogDescription>
            Are you sure you want to clear the entire diagram? This action
            can not be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleClearConfirm}>
            Clear Diagram
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
