import { Edge, Node } from "@xyflow/react";

const API_BASE_URL = "http://localhost:5190/api";

export interface TestCase {
  inputs: number[];
  expectedOutputs: number[];
}

export interface TestRequest {
  diagram: {
    nodes: Node[];
    edges: Edge[];
  }[];
  testCase: TestCase;
}

export interface TestOperationResponse {
  operationId: string;
  status: string;
}

export interface TestResult {
  cancelled: boolean;
  totalPathsTested: number;
  successfulPaths: number;
  successPercentageByOperationLimit: Record<string, number>;
}

export interface TestStatusResponse {
  status: string;
  result: TestResult;
  requestedLimitKPercentage: number | null;
}

/**
 * Starts a test operation by sending a request to the backend API
 * @param nodes The flow nodes
 * @param edges The flow edges
 * @param testCase The test case containing inputs and expected outputs
 * @returns A promise resolving to the operation ID
 */
export async function startTest(
  nodes: Node[],
  edges: Edge[],
  testCase: TestCase
): Promise<string> {
  const request: TestRequest = {
    diagram: [
      {
        nodes,
        edges,
      },
    ],
    testCase,
  };

  try {
    console.log("Sending test request:", JSON.stringify(request, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/diagrams/test/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with error:", response.status, errorText);
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
    }

    const data: TestOperationResponse = await response.json();
    console.log("Test started successfully with operation ID:", data.operationId);
    return data.operationId;
  } catch (error) {
    console.error("Failed to start test:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to start test operation");
  }
}

/**
 * Gets the status of a test operation
 * @param operationId The ID of the test operation
 * @param limitK Optional K value to get specific results for
 * @returns A promise resolving to the test status and results
 */
export async function getTestStatus(
  operationId: string,
  limitK?: number
): Promise<TestStatusResponse> {
  try {
    let url = `${API_BASE_URL}/diagrams/test/${operationId}/status`;
    if (limitK !== undefined) {
      url += `?limitK=${limitK}`;
    }

    console.log(`Fetching test status for operation ${operationId}${limitK ? ` with limitK=${limitK}` : ''}`);
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error fetching test status:", response.status, errorText);
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Test status response:", responseData);
    return responseData;
  } catch (error) {
    console.error("Failed to get test status:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to retrieve test status");
  }
}

/**
 * Cancels a running test operation
 * @param operationId The ID of the test operation to cancel
 * @returns A promise that resolves when the test is successfully canceled
 */
export async function cancelTest(operationId: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/diagrams/test/${operationId}/cancel`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to cancel test:", error);
    throw new Error("Failed to cancel test operation");
  }
}

/**
 * Helper function to create a polling mechanism
 * @param checkFn The function to call periodically
 * @param interval The polling interval in milliseconds
 * @param maxAttempts Maximum number of polling attempts (0 for unlimited)
 * @returns Object with methods to start and stop polling
 */
export function createPoller<T>(
  checkFn: () => Promise<T>,
  interval: number = 2000,
  maxAttempts: number = 0
) {
  let timer: NodeJS.Timeout | null = null;
  let attempts = 0;
  let stopped = false;

  const stop = () => {
    console.log("Stopping poller");
    stopped = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return {
    start: (
      onResult: (result: T) => void,
      onError?: (error: Error) => void,
      onComplete?: () => void
    ) => {
      // Reset state in case start is called multiple times
      attempts = 0;
      stopped = false;
      
      const poll = async () => {
        if (stopped) {
          console.log("Poller stopped, not polling anymore");
          return;
        }

        try {
          attempts++;
          console.log(`Polling attempt ${attempts}...`);
          const result = await checkFn();
          onResult(result);

          // Continue polling if max attempts not reached
          if (maxAttempts === 0 || attempts < maxAttempts) {
            console.log(`Scheduling next poll in ${interval}ms`);
            timer = setTimeout(poll, interval);
          } else {
            console.log("Reached max attempts, stopping poller");
            stop();
            if (onComplete) {
              onComplete();
            }
          }
        } catch (error) {
          console.error("Error in polling:", error);
          if (onError) {
            onError(error instanceof Error ? error : new Error(String(error)));
          }
          // Don't stop polling on error unless explicitly requested
          if (!stopped && (maxAttempts === 0 || attempts < maxAttempts)) {
            console.log(`Error occurred, but continuing polls. Next poll in ${interval}ms`);
            timer = setTimeout(poll, interval);
          } else {
            stop();
            if (onComplete) {
              onComplete();
            }
          }
        }
      };

      // Start polling immediately
      console.log("Starting polling...");
      poll();
    },
    stop,
  };
} 