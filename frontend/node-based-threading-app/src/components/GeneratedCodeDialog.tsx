import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { generateCode } from "@/lib/codeGenerationService";
import { Edge, Node } from "@xyflow/react";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface GeneratedCodeDialogProps {
  nodes: Node[];
  edges: Edge[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GeneratedCodeDialog({
  nodes,
  edges,
  open,
  onOpenChange,
}: GeneratedCodeDialogProps) {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setError(null);
      generateCode({ nodes, edges })
        .then((code) => {
          setGeneratedCode(code);
          setError(null);
        })
        .catch((err) => {
          setError(err.message || 'Failed to generate code');
          setGeneratedCode("");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, nodes, edges]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generated Code</DialogTitle>
          <DialogDescription>
            Here is the C# code generated from your flow diagram.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-[#1E1E1E] my-4 max-h-[60vh] overflow-auto rounded-md">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-white">
              Loading...
            </div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            <SyntaxHighlighter 
              language="csharp"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: '0.375rem',
                background: '#1E1E1E',
              }}
              showLineNumbers
              wrapLines
            >
              {generatedCode}
            </SyntaxHighlighter>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!isLoading && !error && (
            <Button 
              onClick={handleCopyToClipboard} 
              className="ml-2"
            >
              Copy Code
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}