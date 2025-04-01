using System.Text.Json.Serialization;

namespace NodeBasedThreading.API.Models
{
    public class DiagramConnection
    {
        public string Id { get; set; }

        [JsonPropertyName("source")]
        public string SourceId { get; set; }

        [JsonPropertyName("target")]
        public string TargetId { get; set; }

        [JsonPropertyName("type")]
        [JsonConverter(typeof(ConnectionTypeJsonConverter))]
        public ConnectionType Type { get; set; } = ConnectionType.Normal;
    }
}
