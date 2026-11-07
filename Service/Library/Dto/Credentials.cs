namespace TimeTracking.Service.Dto;

/// <summary>
///   Credentials to login a user
/// </summary>
/// <param name="UserName"></param>
/// <param name="Password"></param>
public record Credentials(string UserName, string Password);