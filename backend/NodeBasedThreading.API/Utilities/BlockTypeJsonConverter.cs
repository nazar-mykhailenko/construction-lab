using System.Text.Json;
using System.Text.Json.Serialization;
using NodeBasedThreading.API.Models;

class BlockTypeJsonConverter : JsonConverter<BlockType>
{
    public override BlockType Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        var value = reader.GetString();
        return Enum.TryParse<BlockType>(value, true, out var blockType) ? blockType : BlockType.Operation;
    }

    public override void Write(
        Utf8JsonWriter writer,
        BlockType value,
        JsonSerializerOptions options
    )
    {
        writer.WriteStringValue(value.ToString());
    }
}
