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
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockDialogProps {
  nodes: Node[];
  edges: Edge[];
  buttonText?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CodeBlockDialog({
  nodes,
  edges,
  buttonText = "Save",
  dialogTitle = "Your Flow JSON",
  dialogDescription = "Here is the JSON representation of your flow.",
  open,
  onOpenChange,
}: CodeBlockDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const flowData = {
    nodes,
    edges,
    version: "1.0.0",
    timestamp: Date.now(),
  };

  const jsonString = JSON.stringify(flowData, null, 2);

  const handleDownload = () => {
    downloadFlowAsJson(nodes, edges);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  if (onOpenChange !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="bg-[#1E1E1E] my-4 max-h-[60vh] overflow-auto rounded-md">
            <SyntaxHighlighter 
              language="json"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: '0.375rem',
                background: '#1E1E1E',
              }}
              showLineNumbers
              wrapLines
            >
              {jsonString}
            </SyntaxHighlighter>
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
        <div className="bg-[#1E1E1E] my-4 max-h-[60vh] overflow-auto rounded-md">
          <SyntaxHighlighter 
            language="json"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: '0.375rem',
              background: '#1E1E1E',
            }}
            showLineNumbers
            wrapLines
          >
            {jsonString}
          </SyntaxHighlighter>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
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
