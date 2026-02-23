using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Configurations;
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
    IAuthenticationService service = new AuthenticationServiceService
    (
      this._context,
      new OptionsWrapper<TokenConfiguration>(new TokenConfiguration
      {
        Audience = "test",
        Issuer = "test",
        SecretVariableName = "Test"
      }),
      new TokenSecretConfiguration
      {
        Secret = "2f3fedd50944d446d7859a33a656cffe8783161725e127d5195ba88c41fc3ec1db4b0d4bcae14f0f4d76d209840e9c89d24b76b907236ba3355d395131df99fb" 
      }
    );
    const string
      username = "me",
      password = "pw";
    
    // Arrange
    await service.RegisterUserAsync(username, password);
    
    Assert.Multiple
    (
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
          () => Assert.NotNull(user.ActiveWorkspace),
          () => Assert.Single(user.Workspaces!)
        );
      }
    );
  }

  #endregion
}