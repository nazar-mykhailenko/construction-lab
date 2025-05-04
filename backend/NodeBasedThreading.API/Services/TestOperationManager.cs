using System;
using System.Collections.Concurrent;
using System.Threading;
using NodeBasedThreading.API.Models;

namespace NodeBasedThreading.API.Services
{
    /// <summary>
    /// Manages active test operations and their cancellation tokens
    /// </summary>
    public class TestOperationManager
    {
        private readonly ConcurrentDictionary<string, CancellationTokenSource> _activeOperations = new();
        private readonly ConcurrentDictionary<string, DiagramTestResult> _testResults = new();
        private readonly ConcurrentDictionary<string, string> _operationStatuses = new();
        
        /// <summary>
        /// Creates a new test operation and returns its ID and cancellation token
        /// </summary>
        public (string OperationId, CancellationToken Token) CreateTestOperation()
        {
            var operationId = Guid.NewGuid().ToString();
            var cts = new CancellationTokenSource();
            _activeOperations[operationId] = cts;
            _operationStatuses[operationId] = "running";
            return (operationId, cts.Token);
        }
        
        /// <summary>
        /// Cancels an ongoing test operation
        /// </summary>
        /// <returns>True if operation was found and cancelled, false otherwise</returns>
        public bool CancelOperation(string operationId)
        {
            if (_activeOperations.TryGetValue(operationId, out var cts))
            {
                cts.Cancel();
                _operationStatuses[operationId] = "cancelling";
                return true;
            }
            return false;
        }
        
        /// <summary>
        /// Checks if an operation is currently running
        /// </summary>
        public bool IsOperationActive(string operationId)
        {
            return _activeOperations.ContainsKey(operationId);
        }
        
        /// <summary>
        /// Gets the current status of an operation
        /// </summary>
        public string GetOperationStatus(string operationId)
        {
            return _operationStatuses.TryGetValue(operationId, out var status) ? status : "not_found";
        }
        
        /// <summary>
        /// Stores the result of a completed test operation
        /// </summary>
        public void StoreTestResult(string operationId, DiagramTestResult result)
        {
            _testResults[operationId] = result;
            _operationStatuses[operationId] = result.Cancelled ? "cancelled" : "completed";
        }
        
        /// <summary>
        /// Gets the result of a completed test operation
        /// </summary>
        public DiagramTestResult GetTestResult(string operationId)
        {
            return _testResults.TryGetValue(operationId, out var result) ? result : null;
        }
        
        /// <summary>
        /// Removes a completed operation from tracking
        /// </summary>
        public void CompleteOperation(string operationId)
        {
            _activeOperations.TryRemove(operationId, out _);
            
            // Keep the status and result for later retrieval
        }
    }
}