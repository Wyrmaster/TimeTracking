using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence.Entities;
using TimeTracking.Persistence;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Services;

/// <inheritdoc cref="IAuthentication"/>
public class Authentication: IAuthentication
{
  #region Fields

  private readonly Context _context;
  private readonly HashAlgorithm _provider = MD5.Create();

  #endregion

  #region Constructors

  public Authentication(Context context)
  {
    this._context = context;
  }

  #endregion
  
  #region Authentication

  /// <inheritdoc cref="IAuthentication.AuthenticateAsync"/>
  public Task<bool> AuthenticateAsync(string username, string password)
  {
    string hashedPassword = this.GenerateHash(password);
    return this._context.Users.AnyAsync(user => user.Username == username && user.Password == hashedPassword);
  }

  /// <inheritdoc cref="IAuthentication.ChangePasswordAsync"/>
  public async Task<bool> ChangePasswordAsync(string username, string oldPassword, string newPassword)
  {
    string oldPasswordHash = this.GenerateHash(oldPassword);
    User? user = await this._context.Users.FirstOrDefaultAsync(entry => entry.Username == username && entry.Password == oldPasswordHash);
    if (user == null)
    {
      return false;
    }
    
    user.Password = this.GenerateHash(newPassword);
    return await this._context.SaveChangesAsync() > 0;
  }

  #endregion

  #region Private Methods

  /// <summary>
  ///   converts a string into a base64 hash version of itself using the md5 Hash algorithm
  /// </summary>
  /// <param name="password"></param>
  /// <returns></returns>
  private string GenerateHash(string password) => Convert.ToBase64String(this._provider.ComputeHash(Encoding.Unicode.GetBytes(password)));

  #endregion
}