import { useFlowStore } from "@/hooks/useFlowStore";
import {
    TestStatusResponse,
    cancelTest,
    createPoller,
    getTestStatus,
    startTest,
} from "@/lib/testService";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";

interface TestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TestStep = "create" | "loading" | "results";

export function TestDialog({ open, onOpenChange }: TestDialogProps) {
  const { nodes, edges } = useFlowStore();
  const [step, setStep] = useState<TestStep>("create");
  const [inputs, setInputs] = useState<string>("1, 2");
  const [expectedOutputs, setExpectedOutputs] = useState<string>("0, 1");
  const [kValue, setKValue] = useState<string>("");
  const [operationId, setOperationId] = useState<string>("");
  const [testResult, setTestResult] = useState<TestStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollerRef = useRef<ReturnType<typeof createPoller<TestStatusResponse>> | null>(null);

  // Reset state and clear any polling when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep("create");
      setTestResult(null);
      setOperationId("");
      setError(null);
      setKValue("");
    } else {
      // Clean up the poller when dialog closes
      if (pollerRef.current) {
        pollerRef.current.stop();
        pollerRef.current = null;
      }
    }
  }, [open]);

  // Set up a new poller when operation ID changes
  useEffect(() => {
    if (operationId) {
      const poller = createPoller<TestStatusResponse>(() => getTestStatus(operationId));
      
      poller.start(
        // On result
        (result) => {
          console.log("Poll result:", result);
          setTestResult(result);
          if (result.status === "completed" || result.status === "cancelled") {
            setStep("results");
            poller.stop();
          }
        },
        // On error
        (error) => {
          console.error("Polling error:", error);
          setError(`Error polling test status: ${error.message}`);
          setStep("results");
        }
      );
      
      pollerRef.current = poller;
      return () => {
        console.log("Cleaning up poller");
        poller.stop();
      };
    }
  }, [operationId]);

  const handleStartTest = async () => {
    // Parse inputs and expected outputs
    const inputArray = inputs.split(',').map(item => parseInt(item.trim(), 10));
    const outputArray = expectedOutputs.split(',').map(item => parseInt(item.trim(), 10));

    // Validate input
    if (inputArray.some(isNaN) || outputArray.some(isNaN)) {
      setError("Please enter valid numbers for inputs and expected outputs.");
      return;
    }

    // Reset any previous errors
    setError(null);
    
    // Set the UI to loading state
    setStep("loading");

    try {
      console.log("Starting test with inputs:", inputArray, "and expected outputs:", outputArray);
      
      // Call the API to start the test
      const testOpId = await startTest(nodes, edges, {
        inputs: inputArray,
        expectedOutputs: outputArray,
      });
      
      console.log("Test started with operation ID:", testOpId);
      
      // Set the operation ID which will trigger the polling effect
      setOperationId(testOpId);
    } catch (err) {
      console.error("Failed to start test:", err);
      setError(err instanceof Error ? err.message : "Failed to start test");
      setStep("create");
    }
  };

  const handleGetResult = async () => {
    if (!operationId || !kValue || isNaN(parseInt(kValue, 10))) {
      setError("Please enter a valid K value.");
      return;
    }

    // Parse and validate the K value
    const k = parseInt(kValue, 10);
    
    if (k < 1 || k > 20) {
      setError("K value must be between 1 and 20.");
      return;
    }

    try {
      // Fetch specific K results
      const result = await getTestStatus(operationId, k);
      setTestResult(result);
      setError(null);
    } catch (err) {
      console.error("Failed to get K results:", err);
      setError(err instanceof Error ? err.message : "Failed to get results for K value");
    }
  };

  const handleCancelTest = async () => {
    if (operationId) {
      try {
        // Call the API to cancel the test
        await cancelTest(operationId);
        
        // Stop the polling
        if (pollerRef.current) {
          pollerRef.current.stop();
          pollerRef.current = null;
        }
        
        // Close the dialog
        onOpenChange(false);
      } catch (err) {
        console.error("Failed to cancel test:", err);
        setError(err instanceof Error ? err.message : "Failed to cancel test");
      }
    } else {
      // If no operation ID yet, just close the dialog
      onOpenChange(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case "create":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Create Test</DialogTitle>
              <DialogDescription>
                Enter inputs and expected outputs for the test case.
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="inputs" className="text-right">
                  Inputs
                </label>
                <Input
                  id="inputs"
                  value={inputs}
                  onChange={(e) => setInputs(e.target.value)}
                  placeholder="1, 2, 3"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="outputs" className="text-right">
                  Expected Outputs
                </label>
                <Input
                  id="outputs"
                  value={expectedOutputs}
                  onChange={(e) => setExpectedOutputs(e.target.value)}
                  placeholder="0, 1, 2"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleStartTest}>Start Test</Button>
            </DialogFooter>
          </>
        );
      case "loading":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Testing in Progress</DialogTitle>
              <DialogDescription>
                Please wait while the test is running...
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <div className="mb-4 text-xl font-bold">Running Test...</div>
                <div className="text-sm text-muted-foreground">
                  Operation ID: {operationId}
                </div>
                {testResult && (
                  <div className="mt-2 text-sm">
                    Current status: {testResult.status}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelTest}>
                Cancel Test
              </Button>
            </DialogFooter>
          </>
        );
      case "results":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Test Results</DialogTitle>
              <DialogDescription>
                The test has completed. View the results below.
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}
            
            {testResult && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Status:</div>
                  <div>{testResult.status}</div>
                  
                  <div className="text-sm font-medium">Total Paths Tested:</div>
                  <div>{testResult.result.totalPathsTested}</div>
                  
                  <div className="text-sm font-medium">Successful Paths:</div>
                  <div>{testResult.result.successfulPaths}</div>
                  
                  <div className="text-sm font-medium">Success Rate:</div>
                  <div>
                    {testResult.result.totalPathsTested > 0
                      ? `${(testResult.result.successfulPaths / testResult.result.totalPathsTested * 100).toFixed(2)}%`
                      : "N/A"}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4 mt-4">
                  <label htmlFor="kvalue" className="text-right">
                    Enter K for result
                  </label>
                  <Input
                    id="kvalue"
                    value={kValue}
                    onChange={(e) => setKValue(e.target.value)}
                    placeholder="Enter K (1-20)"
                    className="col-span-2"
                  />
                  <Button onClick={handleGetResult} size="sm">
                    Get result
                  </Button>
                </div>

                {testResult.requestedLimitKPercentage !== null && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <div className="font-medium">Success Rate for K={kValue}:</div>
                    <div className="text-xl font-bold mt-2">
                      {testResult.requestedLimitKPercentage}%
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
} 