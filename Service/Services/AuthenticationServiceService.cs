using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TimeTracking.Persistence.Entities;
using TimeTracking.Persistence;
using TimeTracking.Service.Configurations;
using TimeTracking.Service.Dto;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Services;

/// <inheritdoc cref="IAuthenticationService"/>
public class AuthenticationServiceService(
    Context context,
    IOptions<TokenConfiguration> tokenConfiguration,
    TokenSecretConfiguration tokenSecretConfiguration
  )
  : IAuthenticationService
{
  #region Fields

  private readonly HashAlgorithm _provider = MD5.Create();

  #endregion
  
  #region Authentication

  /// <inheritdoc cref="IAuthenticationService.AuthenticateAsync"/>
  public async Task<Token?> AuthenticateAsync(string username, string password, CancellationToken cancellationToken = default)
  {
    string hashedPassword = this.GenerateHash(password);

    if (!await context.Users.AnyAsync(user => user.Username == username && user.Password == hashedPassword,
          cancellationToken: cancellationToken))
    {
      return null;
    }
    
    return this.GenerateToken(username);
  }

  /// <inheritdoc cref="IAuthenticationService.ChangePasswordAsync"/>
  public async Task<bool> ChangePasswordAsync(string username, string oldPassword, string newPassword, CancellationToken cancellationToken = default)
  {
    string oldPasswordHash = this.GenerateHash(oldPassword);
    User? user = await context.Users.FirstOrDefaultAsync(entry => entry.Username == username && entry.Password == oldPasswordHash, cancellationToken: cancellationToken);
    if (user == null)
    {
      return false;
    }
    
    user.Password = this.GenerateHash(newPassword);
    return await context.SaveChangesAsync(cancellationToken) > 0;
  }

  /// <inheritdoc cref="IAuthenticationService.RegisterUserAsync"/>
  public async Task<Token> RegisterUserAsync(string username, string password, CancellationToken token = default)
  {
    Workspace workspace = new()
    {
      Name = "default",
      IsDefault = true,
      Description = "",
    };
    User user = new()
    {
      Username = username,
      Password = this.GenerateHash(password),
      ActiveWorkspace = workspace
    };
    
    context.Users.Add(user);
    context.Workspaces.Add(workspace);
    await context.SaveChangesAsync(token);
    
    workspace.User = user;
    workspace.ActiveWorkspaceUser = user;
    
    context.Update(user);
    context.Update(workspace);
    await context.SaveChangesAsync(token);

    return this.GenerateToken(username);
  }

  #endregion

  #region Private Methods

  /// <summary>
  ///   converts a string into a base64 hash version of itself using the md5 Hash algorithm
  /// </summary>
  /// <param name="password"></param>
  /// <returns></returns>
  private string GenerateHash(string password) => Convert.ToBase64String(this._provider.ComputeHash(Encoding.Unicode.GetBytes(password)));

  /// <summary>
  ///   Generates a JWT token for the specified username.
  /// </summary>
  /// <param name="username">The username for which the token is generated.</param>
  /// <returns>A <see cref="Token"/> containing the username and generated bearer token, or null if token generation fails.</returns>
  private Token GenerateToken(string username)
  {
    SecurityTokenDescriptor tokenDescriptor = new()
    {
      Subject = new ClaimsIdentity([
        new Claim("Id", Guid.NewGuid().ToString()),
        new Claim("UserName", username),
        new Claim(JwtRegisteredClaimNames.Sub, username),
        new Claim(JwtRegisteredClaimNames.Jti,
          Guid.NewGuid().ToString())
      ]),
      Expires = DateTime.UtcNow.AddHours(12),
      Issuer = tokenConfiguration.Value.Issuer,
      Audience = tokenConfiguration.Value.Audience,
      SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.ASCII.GetBytes(tokenSecretConfiguration.Secret)),
        SecurityAlgorithms.HmacSha512Signature)
    };

    JwtSecurityTokenHandler tokenHandler = new();
    SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);
    //var jwtToken = tokenHandler.WriteToken(token);
    string bearerToken = tokenHandler.WriteToken(token);

    return new Token
    { 
      Username = username,
      BearerToken = bearerToken,
    };
  }
  
  #endregion
}