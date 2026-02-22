using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Persistence.PseudoEntities;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Interfaces;
using TimeTracking.Service.Services;
using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test;

public abstract class WorkspaceTests<TFixture> :IAsyncLifetime
  where TFixture : DatabaseFixtureBase, new()
{
  #region Constants

  private const string User = "TestUser";

  #endregion
  
  #region Fields

  private Context _context = null!;
  
  private TFixture _fixture = null!;

  #endregion
  
  #region AsyncLifetime

  /// <inheritdoc cref="IAsyncLifetime.InitializeAsync"/>
  public async Task InitializeAsync()
  {
    this._fixture = new();
    await this._fixture.InitializeAsync();
    
    this._context = this._fixture.CreateDatabaseContext();
    
    Workspace workspace = new()
    {
      Name = "default",
      IsDefault = true,
      Activities = [],
    };
    
    User user = new()
    {
      Username = User,
      Password = "test",
      ActiveWorkspace = workspace
    };
    
    this._context.Users.Add(user);
    this._context.Workspaces.Add(workspace);
    await this._context.SaveChangesAsync();
    
    workspace.User = user;
    workspace.ActiveWorkspaceUser = user;
    
    this._context.Update(user);
    this._context.Update(workspace);
    
    await this._context.SaveChangesAsync();
  }

  /// <inheritdoc cref="IAsyncLifetime.DisposeAsync"/>
  public async Task DisposeAsync()
  {
    await this._context.DisposeAsync();
    await this._fixture.DisposeAsync();
  }

  #endregion

  #region Tests

  [Fact(DisplayName = "Workspace - Add")]
  public async Task AddNewWorkspace()
  {
    // arrange
    IWorkspaceService workspaceService = new WorkspaceService(this._context);
    long id = await workspaceService.AddWorkspaceAsync(User, "New Workspace", "Some Description");
    
    // Assert
    Assert.Multiple
    (
      () => Assert.NotEqual(0, id),
      () => Assert.Equal(2, this._context.Workspaces.Count()),
      () => 
      {
        Workspace? workspace = this._context.Workspaces.FirstOrDefault(w => w.Id == id);
        Assert.Multiple
        (
          () => Assert.NotNull(workspace),
          () => Assert.Equal("New Workspace", workspace!.Name),
          () => Assert.Equal("Some Description", workspace!.Description)
        );
      }
    );
  }

  [Fact(DisplayName = "Workspace - Update")]
  public async Task UpdateWorkspace()
  {
    // arrange
    IWorkspaceService workspaceService = new WorkspaceService(this._context);
    bool result = await workspaceService.UpdateWorkspaceAsync
    (
      User,
      (await this._context.Workspaces.FirstAsync()).Id,
      "Updated Workspace",
      "Updated Description"
    );
    
    // Assert
    Assert.Multiple
    (
      () => Assert.True(result),
      () =>
      {
        Workspace? workspace = this._context.Workspaces.First();
        Assert.Multiple
        (
          () => Assert.NotNull(workspace),
          () => Assert.Equal("Updated Workspace", workspace!.Name),
          () => Assert.Equal("Updated Description", workspace!.Description)
        );
      }
    );
  }

  [Fact(DisplayName = "Workspace - Remove")]
  public async Task RemoveWorkspace()
  {
    // setup
    Workspace workspace = new()
    {
      User = await this._context.Users.AsTracking().FirstAsync(),
      Name = "Test Workspace to be deleted",
      Description = "Test Description to be deleted",
      Activities = [
        new ()
        {
          ActivityName = "Test",
          Description = "test",
          TimeEntries = [
            new()
            {
              Start = DateTime.UtcNow,
              End = DateTime.UtcNow.AddHours(1),
            }
          ]
        }
      ]
    };
    await this._context.Workspaces.AddAsync(workspace);
    await this._context.SaveChangesAsync();
    
    // arrange
    IWorkspaceService workspaceService = new WorkspaceService(this._context);
    bool result = await workspaceService.RemoveWorkspaceAsync(User, workspace.Id);
    
    // Assert
    Assert.Multiple
    (
      () => Assert.True(result),
      () => Assert.Single(this._context.Workspaces)
    );
  }

  [Fact(DisplayName = "Workspace - Fail Remove Default")]
  public async Task RemoveDefaultWorkspace()
  {
    // arrange
    IWorkspaceService workspaceService = new WorkspaceService(this._context);
    bool result = await workspaceService.RemoveWorkspaceAsync(User, (await this._context.Workspaces.FirstAsync()).Id);
    
    // Assert
    Assert.Multiple
    (
      () => Assert.False(result),
      () => Assert.Single(this._context.Workspaces)
    );
  }

  [Fact(DisplayName = "Workspace - Get")]
  public async Task GetWorkspaces()
  {
    // arrange
    IWorkspaceService workspaceService = new WorkspaceService(this._context);
    IEnumerable<WorkspaceDto> workspaces = await workspaceService.GetWorkspacesAsync(User);
    
    // Assert
    Assert.Multiple
    (
      () => Assert.NotEmpty(workspaces),
      () => Assert.Single(workspaces)
    );
  }

  [Fact(DisplayName = "Workspace - Change Active")]
  public async Task ChangeActiveWorkspace()
  {
    // setup
    const string workspaceName = "Test Workspace";
    const string workspaceDescription = "Test Description";
    Workspace workspace = new()
    {
      User = await this._context.Users.AsTracking().FirstAsync(),
      Name = workspaceName,
      Description = workspaceDescription
    };
    await this._context.Workspaces.AddAsync(workspace);
    await this._context.SaveChangesAsync();
    
    // arrange
    IWorkspaceService workspaceService = new WorkspaceService(this._context);
    ActivityTracking tracking = await workspaceService.SetActiveWorkspaceAsync(User, workspace.Id);
    
    // assert
    Assert.Multiple
    (
      () => Assert.True(tracking.ActivityId == 0),
      () =>
      {
        User user = this._context.Users.Include(entity => entity.ActiveWorkspace).First();
        Assert.Equal(workspace.Id, user.ActiveWorkspaceId);
        Assert.Equal(workspace.Id, user.ActiveWorkspace!.Id);
        Assert.Equal(workspaceName, user.ActiveWorkspace.Name);
        Assert.Equal(workspaceDescription, user.ActiveWorkspace.Description);
      });
  }

  #endregion
}