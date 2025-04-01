namespace NodeBasedThreading.API.Models
{
    public enum ConnectionType
    {
        Normal,
        True, // For condition blocks - true path
        False // For condition blocks - false path
        ,
    }
}
