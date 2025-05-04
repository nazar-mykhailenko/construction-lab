namespace NodeBasedThreading.API.Models
{
    // Supporting types
    public enum BlockType
    {
        Assignment, // V1 = V2
        ConstantAssignment, // V = C
        Read, // INPUT V
        Write, // PRINT V
        Condition, // V == C or V < C
        Operation // Generic operation
        ,
    }
}
