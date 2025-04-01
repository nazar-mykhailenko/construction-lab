using System.Text.Json.Serialization;

namespace NodeBasedThreading.API.Models
{
    public class DiagramBlock
    {
        public string Id { get; set; }

        [JsonPropertyName("type")]
        [JsonConverter(typeof(BlockTypeJsonConverter))]
        public BlockType Type { get; set; }

        [JsonPropertyName("data")]
        public Dictionary<string, string> Data { get; set; } = new();
    }
}
