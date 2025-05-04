using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NodeBasedThreading.API.Models;

namespace NodeBasedThreading.API.Services
{
    /// <summary>
    /// Service to test thread diagrams by simulating different execution paths
    /// </summary>
    public class DiagramTestingService
    {
        /// <summary>
        /// Tests a set of thread diagrams against expected input/output sequences
        /// </summary>
        public async Task<DiagramTestResult> TestDiagrams(
            List<ThreadDiagram> diagrams, 
            DiagramTest testCase, 
            CancellationToken cancellationToken)
        {
            // Initialize result
            var result = new DiagramTestResult();
            
            // Keep track of successful paths for different operation limits
            var successCountByOperationLimit = new Dictionary<int, int>();
            var totalCountByOperationLimit = new Dictionary<int, int>();
            for (int i = 1; i <= 20; i++) 
            {
                successCountByOperationLimit[i] = 0;
                totalCountByOperationLimit[i] = 0;
            }
            
            try
            {
                // Collect shared variables from diagrams
                var sharedVariables = CollectSharedVariables(diagrams);
                
                // Initialize all variable states to 0
                var sharedVariableState = new Dictionary<string, int>();
                foreach (var varName in sharedVariables)
                {
                    sharedVariableState[varName] = 0;
                }

                // Generate all execution paths systematically without any limit
                var pathGenerator = new ThreadPathGenerator(diagrams);
                int pathCount = 0;
                
                foreach (var executionPath in pathGenerator.GenerateAllPaths(cancellationToken))
                {
                    // Check for cancellation
                    if (cancellationToken.IsCancellationRequested)
                    {
                        result.Cancelled = true;
                        break;
                    }
                    
                    // Test this execution path with different operation limits
                    for (int operationLimit = 1; operationLimit <= 20; operationLimit++)
                    {
                        // Create a snapshot of the initial state for this run
                        var currentState = new Dictionary<string, int>(sharedVariableState);
                        
                        // Create a console simulation for this run
                        var consoleSimulator = new ConsoleSimulator(testCase.Inputs);
                        
                        // Execute with this operation limit
                        bool success = ExecutePath(
                            diagrams, 
                            currentState,
                            consoleSimulator,
                            testCase.ExpectedOutputs,
                            executionPath,
                            operationLimit);

                        // Update counts
                        totalCountByOperationLimit[operationLimit]++;
                        if (success) successCountByOperationLimit[operationLimit]++;
                        
                        // For tracking total success (we'll use the highest operation limit)
                        if (operationLimit == 20)
                        {
                            result.TotalPathsTested++;
                            if (success) result.SuccessfulPaths++;
                        }
                    }
                    
                    pathCount++;
                    
                    // Simulate some work being done - allows for cancellation to be detected
                    if (pathCount % 10 == 0)
                    {
                        await Task.Delay(1, cancellationToken);
                    }
                }
            }
            catch (OperationCanceledException)
            {
                result.Cancelled = true;
            }

            // Calculate success percentages
            for (int k = 1; k <= 20; k++)
            {
                double percentage = 0;
                if (totalCountByOperationLimit[k] > 0)
                {
                    percentage = (double)successCountByOperationLimit[k] / totalCountByOperationLimit[k] * 100;
                }
                result.SuccessPercentageByOperationLimit[k] = Math.Round(percentage, 2);
            }

            return result;
        }

        /// <summary>
        /// Executes a specific execution path with a given operation limit
        /// </summary>
        private bool ExecutePath(
            List<ThreadDiagram> diagrams,
            Dictionary<string, int> variableState,
            ConsoleSimulator consoleSimulator,
            List<int> expectedOutputs,
            int[] executionPath,
            int operationLimit)
        {
            // Create thread simulators for all diagrams
            var threadSimulators = new List<ThreadSimulator>();
            for (int i = 0; i < diagrams.Count; i++)
            {
                threadSimulators.Add(new ThreadSimulator(diagrams[i], variableState, consoleSimulator));
            }
            
            // Execute the specified path up to the operation limit
            int operationsExecuted = 0;
            for (int i = 0; i < executionPath.Length && operationsExecuted < operationLimit; i++)
            {
                int threadIndex = executionPath[i];
                
                // Skip if this thread is already completed
                if (threadSimulators[threadIndex].IsCompleted)
                {
                    continue;
                }
                
                // Execute the next operation in this thread
                threadSimulators[threadIndex].ExecuteNextOperation();
                operationsExecuted++;
            }
            
            // Compare output sequence with expected
            return consoleSimulator.OutputMatches(expectedOutputs);
        }

        /// <summary>
        /// Collects all shared variables from all diagrams
        /// </summary>
        private HashSet<string> CollectSharedVariables(List<ThreadDiagram> diagrams)
        {
            var sharedVariables = new HashSet<string>();

            foreach (var diagram in diagrams)
            {
                foreach (var block in diagram.Nodes)
                {
                    switch (block.Type)
                    {
                        case BlockType.Assignment:
                            if (block.Data.TryGetValue("leftVariable", out var leftVariable))
                                sharedVariables.Add(leftVariable);
                            if (block.Data.TryGetValue("rightVariable", out var rightVariable))
                                sharedVariables.Add(rightVariable);
                            break;

                        case BlockType.ConstantAssignment:
                            if (block.Data.TryGetValue("variable", out var constVar))
                                sharedVariables.Add(constVar);
                            break;

                        case BlockType.Read:
                            if (block.Data.TryGetValue("variable", out var inputVar))
                                sharedVariables.Add(inputVar);
                            break;

                        case BlockType.Write:
                            if (block.Data.TryGetValue("variable", out var printVar))
                                sharedVariables.Add(printVar);
                            break;

                        case BlockType.Condition:
                            if (block.Data.TryGetValue("variable", out var condVar))
                                sharedVariables.Add(condVar);
                            break;
                    }
                }
            }

            return sharedVariables;
        }

        /// <summary>
        /// Class that systematically generates all possible thread execution paths
        /// </summary>
        private class ThreadPathGenerator
        {
            private readonly List<ThreadDiagram> _diagrams;
            private readonly int _totalThreads;
            private readonly List<int> _operationsPerThread;
            
            public ThreadPathGenerator(List<ThreadDiagram> diagrams)
            {
                _diagrams = diagrams;
                _totalThreads = diagrams.Count;
                
                // Estimate operations per thread (this is an approximation)
                _operationsPerThread = new List<int>();
                foreach (var diagram in _diagrams)
                {
                    _operationsPerThread.Add(EstimateOperations(diagram));
                }
            }
            
            /// <summary>
            /// Estimates the number of operations in a diagram
            /// </summary>
            private int EstimateOperations(ThreadDiagram diagram)
            {
                // Since we don't know how many operations will actually be performed
                // (due to conditional branches), we'll count all nodes as a rough estimate
                return diagram.Nodes.Count;
            }
            
            /// <summary>
            /// Systematically generates all possible thread execution paths
            /// </summary>
            public IEnumerable<int[]> GenerateAllPaths(CancellationToken cancellationToken)
            {
                // Start with a partial path where no threads have executed
                var initialState = new ThreadExecutionState(_totalThreads, _operationsPerThread);
                
                // Use depth-first search to explore all possible paths
                var stack = new Stack<ThreadExecutionState>();
                stack.Push(initialState);
                
                while (stack.Count > 0 && !cancellationToken.IsCancellationRequested)
                {
                    var currentState = stack.Pop();
                    
                    // If all threads are completed, yield the path
                    if (currentState.IsComplete())
                    {
                        yield return currentState.GetPath();
                        continue;
                    }
                    
                    // Determine which threads can execute next
                    for (int i = _totalThreads - 1; i >= 0; i--) // Push in reverse order so we get "natural" order when popping
                    {
                        if (currentState.CanThreadExecute(i))
                        {
                            // Create a new state with this thread executed next
                            var nextState = currentState.Clone();
                            nextState.ExecuteThread(i);
                            stack.Push(nextState);
                        }
                    }
                }
            }
        }
        
        /// <summary>
        /// Class representing the state of thread execution for path generation
        /// </summary>
        private class ThreadExecutionState
        {
            private readonly int[] _operationsExecuted;
            private readonly int[] _maxOperations;
            private readonly List<int> _path;
            private readonly int _totalThreads;
            
            public ThreadExecutionState(int totalThreads, List<int> maxOperationsPerThread)
            {
                _totalThreads = totalThreads;
                _operationsExecuted = new int[totalThreads];
                _maxOperations = maxOperationsPerThread.ToArray();
                _path = new List<int>();
            }
            
            private ThreadExecutionState(int totalThreads, int[] operationsExecuted, int[] maxOperations, List<int> path)
            {
                _totalThreads = totalThreads;
                _operationsExecuted = (int[])operationsExecuted.Clone();
                _maxOperations = (int[])maxOperations.Clone();
                _path = new List<int>(path);
            }
            
            public ThreadExecutionState Clone()
            {
                return new ThreadExecutionState(_totalThreads, _operationsExecuted, _maxOperations, _path);
            }
            
            public bool CanThreadExecute(int threadIndex)
            {
                return threadIndex >= 0 && threadIndex < _totalThreads && _operationsExecuted[threadIndex] < _maxOperations[threadIndex];
            }
            
            public void ExecuteThread(int threadIndex)
            {
                if (CanThreadExecute(threadIndex))
                {
                    _operationsExecuted[threadIndex]++;
                    _path.Add(threadIndex);
                }
            }
            
            public bool IsComplete()
            {
                // All threads have executed all their operations
                for (int i = 0; i < _totalThreads; i++)
                {
                    if (_operationsExecuted[i] < _maxOperations[i])
                    {
                        return false;
                    }
                }
                return true;
            }
            
            public int[] GetPath()
            {
                return _path.ToArray();
            }
        }

        /// <summary>
        /// Inner class to simulate a console input/output
        /// </summary>
        private class ConsoleSimulator 
        {
            private readonly Queue<int> _inputQueue;
            private readonly List<int> _outputHistory = new();
            
            public ConsoleSimulator(List<int> inputs)
            {
                _inputQueue = new Queue<int>(inputs);
            }
            
            /// <summary>
            /// Read next input value from console
            /// </summary>
            public int ReadInput()
            {
                if (_inputQueue.Count > 0)
                {
                    return _inputQueue.Dequeue();
                }
                return 0; // Default value if no more inputs
            }
            
            /// <summary>
            /// Write output to console
            /// </summary>
            public void WriteOutput(int value)
            {
                _outputHistory.Add(value);
            }
            
            /// <summary>
            /// Check if output history matches expected output sequence
            /// </summary>
            public bool OutputMatches(List<int> expectedOutputs)
            {
                // If output counts don't match, test fails
                if (_outputHistory.Count != expectedOutputs.Count)
                {
                    return false;
                }
                
                // Compare each output value
                for (int i = 0; i < expectedOutputs.Count; i++)
                {
                    if (_outputHistory[i] != expectedOutputs[i])
                    {
                        return false;
                    }
                }
                
                return true;
            }
        }

        /// <summary>
        /// Inner class to simulate execution of a thread diagram
        /// </summary>
        private class ThreadSimulator
        {
            private readonly ThreadDiagram _diagram;
            private readonly Dictionary<string, int> _variableState;
            private readonly ConsoleSimulator _consoleSimulator;
            private string _currentBlockId;
            
            public bool IsCompleted { get; private set; } = false;

            public ThreadSimulator(ThreadDiagram diagram, Dictionary<string, int> variableState, ConsoleSimulator consoleSimulator)
            {
                _diagram = diagram;
                _variableState = variableState;
                _consoleSimulator = consoleSimulator;
                
                // Find the start block
                _currentBlockId = GetStartBlockId(diagram);
            }

            /// <summary>
            /// Execute the next operation in this thread
            /// </summary>
            public void ExecuteNextOperation()
            {
                if (IsCompleted) return;
                
                // Find the current block
                var block = _diagram.Nodes.FirstOrDefault(b => b.Id == _currentBlockId);
                if (block == null)
                {
                    IsCompleted = true;
                    return;
                }
                
                // Execute the block
                switch (block.Type)
                {
                    case BlockType.Assignment:
                        ExecuteAssignment(block);
                        break;
                        
                    case BlockType.ConstantAssignment:
                        ExecuteConstantAssignment(block);
                        break;
                        
                    case BlockType.Read:
                        ExecuteRead(block);
                        break;
                        
                    case BlockType.Write:
                        ExecuteWrite(block);
                        break;
                        
                    case BlockType.Condition:
                        ExecuteCondition(block);
                        return; // Don't advance automatically for conditions
                        
                    case BlockType.End:
                        IsCompleted = true;
                        return;
                }
                
                // Find and move to the next block
                var nextConnection = _diagram.Edges.FirstOrDefault(c => 
                    c.SourceId == block.Id && c.Type == ConnectionType.Normal);
                    
                if (nextConnection != null)
                {
                    _currentBlockId = nextConnection.TargetId;
                }
                else
                {
                    IsCompleted = true;
                }
            }
            
            private void ExecuteAssignment(DiagramBlock block)
            {
                if (block.Data.TryGetValue("leftVariable", out var leftVariable) && 
                    block.Data.TryGetValue("rightVariable", out var rightVariable) && 
                    _variableState.TryGetValue(rightVariable, out var value))
                {
                    _variableState[leftVariable] = value;
                }
            }
            
            private void ExecuteConstantAssignment(DiagramBlock block)
            {
                if (block.Data.TryGetValue("variable", out var constVar) && 
                    block.Data.TryGetValue("constant", out var constant) && 
                    int.TryParse(constant, out int constValue))
                {
                    _variableState[constVar] = constValue;
                }
            }
            
            private void ExecuteRead(DiagramBlock block)
            {
                if (block.Data.TryGetValue("variable", out var variable))
                {
                    // Read from console input
                    int inputValue = _consoleSimulator.ReadInput();
                    _variableState[variable] = inputValue;
                }
            }
            
            private void ExecuteWrite(DiagramBlock block)
            {
                if (block.Data.TryGetValue("variable", out var variable) && 
                    _variableState.TryGetValue(variable, out var value))
                {
                    // Write to console output
                    _consoleSimulator.WriteOutput(value);
                }
            }
            
            private void ExecuteCondition(DiagramBlock block)
            {
                if (block.Data.TryGetValue("variable", out var condVar) && 
                    block.Data.TryGetValue("operator", out var op) && 
                    block.Data.TryGetValue("constant", out var condConst) && 
                    int.TryParse(condConst, out int condConstValue) &&
                    _variableState.TryGetValue(condVar, out int varValue))
                {
                    bool conditionMet = EvaluateCondition(varValue, op, condConstValue);
                    
                    // Find the appropriate next connection based on condition
                    var nextConnection = _diagram.Edges.FirstOrDefault(c => 
                        c.SourceId == block.Id && 
                        c.Type == (conditionMet ? ConnectionType.True : ConnectionType.False));
                        
                    if (nextConnection != null)
                    {
                        _currentBlockId = nextConnection.TargetId;
                    }
                    else
                    {
                        IsCompleted = true;
                    }
                }
                else
                {
                    // If the condition can't be evaluated, end the thread
                    IsCompleted = true;
                }
            }
            
            private bool EvaluateCondition(int value, string op, int compareValue)
            {
                return op switch
                {
                    "==" => value == compareValue,
                    "<" => value < compareValue,
                    ">" => value > compareValue,
                    "<=" => value <= compareValue,
                    ">=" => value >= compareValue,
                    "!=" => value != compareValue,
                    _ => false
                };
            }
            
            private static string GetStartBlockId(ThreadDiagram diagram)
            {
                // Find the start block - the one that has no incoming connections
                var blockIdsWithIncoming = diagram.Edges.Select(c => c.TargetId).ToHashSet();
                return diagram.Nodes.FirstOrDefault(b => !blockIdsWithIncoming.Contains(b.Id))?.Id
                    ?? diagram.Nodes.FirstOrDefault()?.Id
                    ?? "start";
            }
        }
    }
}