using Microsoft.AspNetCore.Mvc;
using NodeBasedThreading.API.Models;
using NodeBasedThreading.API.Services;
using System.Threading;

namespace NodeBasedThreading.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiagramsController : ControllerBase
    {
        private readonly DiagramTestingService _testingService;
        private readonly TestOperationManager _testOperationManager;

        public DiagramsController(DiagramTestingService testingService, TestOperationManager testOperationManager)
        {
            _testingService = testingService;
            _testOperationManager = testOperationManager;
        }

        [HttpPost("generate")]
        public string GenerateThreadDiagramsCode(List<ThreadDiagram> undividedDiagram)
        {
            List<ThreadDiagram> diagrams = undividedDiagram[0]
                .Nodes.Where(n => n.ParentId != null && n.Type != BlockType.Operation)
                .GroupBy(n => n.ParentId)
                .Select(g => new ThreadDiagram
                {
                    Nodes = g.ToList(),
                    Edges = undividedDiagram[0].Edges,
                })
                .ToList();
            var generator = new DiagramCodeGenerator();
            string code = generator.GenerateCodeFromDiagrams(diagrams);

            return code;
        }

        [HttpPost("test/start")]
        public ActionResult<TestOperationResponse> StartTest([FromBody] TestRequest request)
        {
            try
            {
                // Extract and prepare the diagrams just like in the generate endpoint
                List<ThreadDiagram> diagrams = request.Diagram[0]
                    .Nodes.Where(n => n.ParentId != null && n.Type != BlockType.Operation)
                    .GroupBy(n => n.ParentId)
                    .Select(g => new ThreadDiagram
                    {
                        Nodes = g.ToList(),
                        Edges = request.Diagram[0].Edges,
                    })
                    .ToList();

                // Create a new test operation with cancellation token
                var (operationId, token) = _testOperationManager.CreateTestOperation();
                
                // Start the test in background
                _ = Task.Run(async () =>
                {
                    try
                    {
                        // Run the test simulation
                        var result = await _testingService.TestDiagrams(
                            diagrams, 
                            request.TestCase,
                            token);
                            
                        // Store the result for later retrieval
                        _testOperationManager.StoreTestResult(operationId, result);
                    }
                    catch (OperationCanceledException)
                    {
                        // Test was cancelled, store a cancelled result
                        _testOperationManager.StoreTestResult(operationId, new DiagramTestResult { Cancelled = true });
                    }
                    catch (Exception ex)
                    {
                        // Log the error
                        Console.WriteLine($"Error in test operation {operationId}: {ex.Message}");
                        
                        // Store an error result
                        _testOperationManager.StoreTestResult(operationId, new DiagramTestResult 
                        { 
                            Cancelled = true,
                            // We could add an Error property to DiagramTestResult in a real implementation
                        });
                    }
                    finally
                    {
                        // Always clean up the operation
                        _testOperationManager.CompleteOperation(operationId);
                    }
                });

                // Return the operation ID to the client
                return Ok(new TestOperationResponse 
                { 
                    OperationId = operationId,
                    Status = "started"
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to start test: {ex.Message}");
            }
        }

        [HttpGet("test/{operationId}/status")]
        public ActionResult<TestStatusResponse> GetTestStatus(string operationId, [FromQuery] int? limitK = null)
        {
            // Get the current status
            string status = _testOperationManager.GetOperationStatus(operationId);
            
            // If the operation is not found
            if (status == "not_found")
            {
                return NotFound(new { Status = "not_found", Message = "Test operation not found" });
            }
            
            // Create the response
            var response = new TestStatusResponse
            {
                Status = status
            };
            
            // If the test is complete, include results
            if (status == "completed" || status == "cancelled")
            {
                var result = _testOperationManager.GetTestResult(operationId);
                if (result != null)
                {
                    response.Result = result;
                    
                    // If a specific limit K is requested, filter for that K only
                    if (limitK.HasValue && limitK.Value >= 1 && limitK.Value <= 20)
                    {
                        if (result.SuccessPercentageByOperationLimit.TryGetValue(limitK.Value, out double percentage))
                        {
                            response.RequestedLimitKPercentage = percentage;
                        }
                    }
                }
            }
            
            return Ok(response);
        }

        [HttpPost("test/{operationId}/cancel")]
        public ActionResult CancelTest(string operationId)
        {
            bool cancelled = _testOperationManager.CancelOperation(operationId);
            
            if (cancelled)
            {
                return Ok(new { Status = "cancellation_requested", Message = "Test cancellation requested" });
            }
            
            return NotFound(new { Status = "not_found", Message = "Test operation not found or already completed" });
        }
    }

    /// <summary>
    /// Request model for testing diagrams
    /// </summary>
    public class TestRequest
    {
        /// <summary>
        /// The diagram to test
        /// </summary>
        public List<ThreadDiagram> Diagram { get; set; } = new();

        /// <summary>
        /// The test case with inputs and expected outputs
        /// </summary>
        public DiagramTest TestCase { get; set; } = new();
    }

    /// <summary>
    /// Response model for test operations
    /// </summary>
    public class TestOperationResponse
    {
        /// <summary>
        /// Unique ID for the test operation
        /// </summary>
        public string OperationId { get; set; }
        
        /// <summary>
        /// Status of the test operation
        /// </summary>
        public string Status { get; set; }
    }
    
    /// <summary>
    /// Response model for test status
    /// </summary>
    public class TestStatusResponse
    {
        /// <summary>
        /// Status of the test operation: "running", "cancelling", "completed", "cancelled"
        /// </summary>
        public string Status { get; set; }
        
        /// <summary>
        /// Test result, only populated if status is "completed" or "cancelled"
        /// </summary>
        public DiagramTestResult Result { get; set; }
        
        /// <summary>
        /// Success percentage for the specifically requested K limit, if any
        /// </summary>
        public double? RequestedLimitKPercentage { get; set; }
    }
}
