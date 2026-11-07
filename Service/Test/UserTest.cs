using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Configurations;
using TimeTracking.Service.Dto;
using TimeTracking.Service.Interfaces;
using TimeTracking.Service.Services;
using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test;

public abstract class UserTest<TFixture> :IAsyncLifetime
  where TFixture : DatabaseFixtureBase, new()
{
  #region Fields

  private Context _context = null!;
  
  private TFixture _fixture = null!;

  #endregion
  
  #region AsyncLifetime
  
  public async Task InitializeAsync()
  {
    this._fixture = new();
    await this._fixture.InitializeAsync();
    
    this._context = this._fixture.CreateDatabaseContext();
  }

  public async Task DisposeAsync()
  {
    await this._context.DisposeAsync();
    await this._fixture.DisposeAsync();
  }

  #endregion

  #region Tests

  [Fact(DisplayName = "User - Register New User")]
  public async Task TestRegisterNewUser()
  {
    // Setup
    IAccountService service = this.CreateService();
    const string
      username = "me",
      password = "pw";

    // Arrange
    Token? token = await service.RegisterUserAsync(username, password);

    Assert.Multiple
    (
      () => Assert.NotNull(token),
      () => Assert.Single(this._context.Users),
      () => Assert.Single(this._context.Workspaces),
      () =>
      {
        User user = this._context
          .Users
          .Include(entity => entity.ActiveWorkspace)
          .Include(entity => entity.Workspaces)
          .First();
        Assert.Multiple
        (
          () => Assert.Equal(username, user.Username),
          () => Assert.NotEqual(password, user.Password),
          () => Assert.NotNull(user.ActiveWorkspace),
          () => Assert.Single(user.Workspaces!)
        );
      }
    );
  }

  [Fact(DisplayName = "User - Register Taken Username")]
  public async Task TestRegisterTakenUsername()
  {
    IAccountService service = this.CreateService();

    await service.RegisterUserAsync("me", "pw");
    Token? token = await service.RegisterUserAsync("me", "other");

    Assert.Multiple
    (
      () => Assert.Null(token),
      () => Assert.Single(this._context.Users)
    );
  }

  [Fact(DisplayName = "User - Authenticate")]
  public async Task TestAuthenticate()
  {
    IAccountService service = this.CreateService();

    await service.RegisterUserAsync("me", "pw");

    Token? valid = await service.AuthenticateAsync("me", "pw");
    Token? wrongPassword = await service.AuthenticateAsync("me", "wrong");
    Token? unknownUser = await service.AuthenticateAsync("unknown", "pw");

    Assert.Multiple
    (
      () => Assert.NotNull(valid),
      () => Assert.Null(wrongPassword),
      () => Assert.Null(unknownUser)
    );
  }

  [Fact(DisplayName = "User - Change Password")]
  public async Task TestChangePassword()
  {
    IAccountService service = this.CreateService();

    await service.RegisterUserAsync("me", "pw");

    bool wrongOldPassword = await service.ChangePasswordAsync("me", "wrong", "new");
    bool changed = await service.ChangePasswordAsync("me", "pw", "new");

    Token? oldPassword = await service.AuthenticateAsync("me", "pw");
    Token? newPassword = await service.AuthenticateAsync("me", "new");

    Assert.Multiple
    (
      () => Assert.False(wrongOldPassword),
      () => Assert.True(changed),
      () => Assert.Null(oldPassword),
      () => Assert.NotNull(newPassword)
    );
  }

  [Fact(DisplayName = "User - Upgrade Legacy Password Hash")]
  public async Task TestUpgradeLegacyHash()
  {
    // a user registered before passwords were salted, stored as unsalted md5
    string legacyHash = Convert.ToBase64String(MD5.HashData(Encoding.Unicode.GetBytes("pw")));
    Workspace workspace = new()
    {
      Name = "default",
      IsDefault = true,
      Description = string.Empty,
    };
    User user = new()
    {
      Username = "legacy",
      Password = legacyHash,
      ActiveWorkspace = workspace,
    };
    this._context.Users.Add(user);
    this._context.Workspaces.Add(workspace);
    await this._context.SaveChangesAsync();

    IAccountService service = this.CreateService();

    Token? wrong = await service.AuthenticateAsync("legacy", "wrong");
    Token? token = await service.AuthenticateAsync("legacy", "pw");
    Token? again = await service.AuthenticateAsync("legacy", "pw");

    string storedHash = this._context
      .Users
      .Single(entity => entity.Username == "legacy")
      .Password;

    Assert.Multiple
    (
      () => Assert.Null(wrong),
      () => Assert.NotNull(token),
      () => Assert.NotNull(again),
      () => Assert.NotEqual(legacyHash, storedHash)
    );
  }

  #endregion

  #region Private Methods

  private IAccountService CreateService() => new AccountService
  (
    this._context,
    new PasswordHasher<User>(),
    new OptionsWrapper<TokenConfiguration>(new TokenConfiguration
    {
      Audience = "test",
      Issuer = "test",
      SecretVariableName = "Test",
    }),
    new TokenSecretConfiguration
    {
      Secret = Convert.ToHexString(RandomNumberGenerator.GetBytes(64)),
    }
  );

  #endregion
}
