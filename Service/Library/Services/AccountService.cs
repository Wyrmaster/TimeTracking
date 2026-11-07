using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TimeTracking.Persistence.Entities;
using TimeTracking.Persistence;
using TimeTracking.Service.Configurations;
using TimeTracking.Service.Dto;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Services;

/// <inheritdoc cref="IAccountService"/>
public class AccountService
(
  Context context,
  IPasswordHasher<User> passwordHasher,
  IOptions<TokenConfiguration> tokenConfiguration,
  TokenSecretConfiguration tokenSecretConfiguration
)
  : IAccountService
{
  #region Account

  /// <inheritdoc cref="IAccountService.AuthenticateAsync"/>
  public async Task<Token?> AuthenticateAsync(string username, string password, CancellationToken cancellationToken = default)
  {
    User? user = await context
      .Users
      .AsTracking()
      .FirstOrDefaultAsync(entry => entry.Username == username, cancellationToken);

    if (user == null || !await this.VerifyPasswordAsync(user, password, cancellationToken))
    {
      return null;
    }

    return this.GenerateToken(username);
  }

  /// <inheritdoc cref="IAccountService.ChangePasswordAsync"/>
  public async Task<bool> ChangePasswordAsync
  (
    string username,
    string oldPassword,
    string newPassword,
    CancellationToken cancellationToken = default
  )
  {
    User? user = await context
      .Users
      .AsTracking()
      .FirstOrDefaultAsync(entry => entry.Username == username, cancellationToken);

    if (user == null || !await this.VerifyPasswordAsync(user, oldPassword, cancellationToken))
    {
      return false;
    }

    user.Password = passwordHasher.HashPassword(user, newPassword);

    return await context.SaveChangesAsync(cancellationToken) > 0;
  }

  /// <inheritdoc cref="IAccountService.RegisterUserAsync"/>
  public async Task<Token?> RegisterUserAsync(string username, string password, CancellationToken token = default)
  {
    if (await context.Users.AnyAsync(entry => entry.Username == username, token))
    {
      return null;
    }

    Workspace workspace = new()
    {
      Name = "default",
      IsDefault = true,
      Description = "",
    };
    User user = new()
    {
      Username = username,
      Password = string.Empty,
      ActiveWorkspace = workspace,
    };
    user.Password = passwordHasher.HashPassword(user, password);

    context.Users.Add(user);
    context.Workspaces.Add(workspace);
    await context.SaveChangesAsync(token);

    workspace.User = user;
    workspace.ActiveWorkspaceUser = user;

    await context.SaveChangesAsync(token);

    return this.GenerateToken(username);
  }

  #endregion

  #region Private Methods

  /// <summary>
  ///   Verifies the password of a user. Passwords still stored as legacy unsalted md5 hash are upgraded to the
  ///   current hash format once verified.
  /// </summary>
  /// <param name="user">tracked user to verify the password of</param>
  /// <param name="password">password to verify</param>
  /// <param name="token"></param>
  /// <returns>whether the password is valid</returns>
  private async Task<bool> VerifyPasswordAsync(User user, string password, CancellationToken token)
  {
    if (AccountService.IsLegacyHash(user.Password))
    {
      if (!CryptographicOperations.FixedTimeEquals
          (
            Encoding.ASCII.GetBytes(AccountService.GenerateLegacyHash(password)),
            Encoding.ASCII.GetBytes(user.Password)
          ))
      {
        return false;
      }

      user.Password = passwordHasher.HashPassword(user, password);
      await context.SaveChangesAsync(token);

      return true;
    }

    PasswordVerificationResult result = passwordHasher.VerifyHashedPassword(user, user.Password, password);

    if (result == PasswordVerificationResult.SuccessRehashNeeded)
    {
      user.Password = passwordHasher.HashPassword(user, password);
      await context.SaveChangesAsync(token);
    }

    return result != PasswordVerificationResult.Failed;
  }

  /// <summary>
  ///   Whether a stored password is a legacy md5 hash, which is always 24 characters long as base64
  /// </summary>
  /// <param name="storedPassword">the stored password hash</param>
  /// <returns></returns>
  private static bool IsLegacyHash(string storedPassword) => storedPassword.Length == 24;

  /// <summary>
  ///   Creates the legacy unsalted md5 hash, only used to verify and upgrade old passwords
  /// </summary>
  /// <param name="password">password to hash</param>
  /// <returns>base64 encoded md5 hash</returns>
  private static string GenerateLegacyHash(string password)
    => Convert.ToBase64String(MD5.HashData(Encoding.Unicode.GetBytes(password)));

  /// <summary>
  ///   Generates a JWT token for the specified username.
  /// </summary>
  /// <param name="username">The username for which the token is generated.</param>
  /// <returns>A <see cref="Token"/> containing the username and generated bearer token</returns>
  private Token GenerateToken(string username)
  {
    SecurityTokenDescriptor tokenDescriptor = new()
    {
      Subject = new ClaimsIdentity([
        new Claim("Id", $"{Guid.NewGuid()}"),
        new Claim("UserName", username),
        new Claim(JwtRegisteredClaimNames.Sub, username),
        new Claim(JwtRegisteredClaimNames.Jti, $"{Guid.NewGuid()}"),
      ]),
      Expires = DateTime.UtcNow.AddHours(12),
      Issuer = tokenConfiguration.Value.Issuer,
      Audience = tokenConfiguration.Value.Audience,
      SigningCredentials = new SigningCredentials
      (
        new SymmetricSecurityKey(Encoding.ASCII.GetBytes(tokenSecretConfiguration.Secret)),
        SecurityAlgorithms.HmacSha512Signature
      ),
    };

    JwtSecurityTokenHandler tokenHandler = new();
    SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

    return new Token
    {
      Username = username,
      BearerToken = tokenHandler.WriteToken(token),
    };
  }

  #endregion
}
