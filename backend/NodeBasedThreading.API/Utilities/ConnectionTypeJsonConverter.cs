using System.Text.Json;
using System.Text.Json.Serialization;
using NodeBasedThreading.API.Models;

class ConnectionTypeJsonConverter : JsonConverter<ConnectionType>
{
    public override ConnectionType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        return Enum.TryParse<ConnectionType>(value, out var connectionType) ? connectionType : ConnectionType.Normal;
    }

    public override void Write(Utf8JsonWriter writer, ConnectionType value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString());
    }
}