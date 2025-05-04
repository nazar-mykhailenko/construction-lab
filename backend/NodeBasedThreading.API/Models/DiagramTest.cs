using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace NodeBasedThreading.API.Models
{
    /// <summary>
    /// Represents a test case for thread diagrams
    /// </summary>
    public class DiagramTest
    {
        /// <summary>
        /// Sequence of input values that would be entered into console
        /// </summary>
        [JsonPropertyName("inputs")]
        public List<int> Inputs { get; set; } = new();

        /// <summary>
        /// Expected sequence of output values that should be printed to console
        /// </summary>
        [JsonPropertyName("expectedOutputs")] 
        public List<int> ExpectedOutputs { get; set; } = new();
    }
}