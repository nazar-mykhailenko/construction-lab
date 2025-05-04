using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace NodeBasedThreading.API.Models
{
    /// <summary>
    /// Represents the results of testing thread diagrams
    /// </summary>
    public class DiagramTestResult
    {
        /// <summary>
        /// Whether the test was cancelled
        /// </summary>
        [JsonPropertyName("cancelled")]
        public bool Cancelled { get; set; }

        /// <summary>
        /// Total number of execution paths tested
        /// </summary>
        [JsonPropertyName("totalPathsTested")]
        public int TotalPathsTested { get; set; }

        /// <summary>
        /// Number of successful execution paths
        /// </summary>
        [JsonPropertyName("successfulPaths")]
        public int SuccessfulPaths { get; set; }

        /// <summary>
        /// Success percentage for different operation limits
        /// Key: Operation limit (k)
        /// Value: Percentage of successful paths within that limit
        /// </summary>
        [JsonPropertyName("successPercentageByOperationLimit")]
        public Dictionary<int, double> SuccessPercentageByOperationLimit { get; set; } = new();
    }
}