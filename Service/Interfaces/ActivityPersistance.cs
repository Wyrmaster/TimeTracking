namespace TimeTracking.Service.Interfaces;

/// <summary>
///   Starts an activity and stops the previous one if possible
/// </summary>
public interface IActivityPersistence
{
  #region Methods

  /// <summary>
  ///   Sets the new DiceSide Id and starts or completes an activity time span
  /// </summary>
  /// <param name="userName">name of the user to update times</param>
  /// <param name="newDiceSideId">new side Id</param>
  /// <returns></returns>
  Task SetNewActiveActivityAsync(string userName, int newDiceSideId);

  #endregion
}