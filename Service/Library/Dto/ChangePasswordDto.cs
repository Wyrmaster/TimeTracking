namespace TimeTracking.Service.Dto;

/// <summary>
///   Request to change the password of the authenticated user
/// </summary>
/// <param name="OldPassword">current password of the user</param>
/// <param name="NewPassword">password to set</param>
public record ChangePasswordDto(string OldPassword, string NewPassword);
