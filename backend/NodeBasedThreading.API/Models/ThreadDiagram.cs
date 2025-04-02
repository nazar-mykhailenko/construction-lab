using System.Text.Json.Serialization;

namespace NodeBasedThreading.API.Models
{
    public class ThreadDiagram
    {
        // public string Id { get; set; }
        // public string Name { get; set; }

        [JsonPropertyName("nodes")]
        public List<DiagramBlock> Nodes { get; set; } = new();

        [JsonPropertyName("edges")]
        public List<DiagramConnection> Edges { get; set; } = new();
    }
}
