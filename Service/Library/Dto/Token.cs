namespace TimeTracking.Service.Dto;

/// <summary>
///   JWT for a login
/// </summary>
/// <param name="Username">Username a token is issued to</param>
/// <param name="BearerToken">Token a user can use to authenticate</param>
public record struct Token(string Username, string BearerToken);