using TimeTracking.Persistence;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Services;

public class ActivityPersistence: IActivityPersistence
{
  #region Fields

  private readonly Context _context;

  #endregion

  #region Constructors

  public ActivityPersistence(Context context)
  {
    this._context = context;
  }

  #endregion
  
  #region ActivityPersistence

  /// <inheritdoc cref="IActivityPersistence.SetNewActiveActivityAsync"/>
  public Task SetNewActiveActivityAsync(string userName, int newDiceSideId)
  {
    return Task.CompletedTask;
  }

  #endregion
}