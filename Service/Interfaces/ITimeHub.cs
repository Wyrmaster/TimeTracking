namespace TimeTracking.Service.Interfaces;

/// <summary>
///   Interface implementing SignalR time hub methods
/// </summary>
public interface ITimeHub
{
  #region Methods

  /// <summary>
  ///   Notifies a client that an Activity stops tracking
  /// </summary>
  /// <param name="username">name of the client to notify</param>
  /// <param name="token"></param>
  /// <returns></returns>
  Task StopTrackingAsync(string username, CancellationToken token = default);
  
  /// <summary>
  ///   Notifies a client that an Activity starts tracking
  /// </summary>
  /// <param name="userName">name of the client to notify</param>
  /// <param name="activityId">id of the activity that started tracking</param>
  /// <param name="timeStamp">timestamp when Tracking began</param>
  /// <param name="token"></param>
  /// <returns></returns>
  Task StartTrackingAsync(string userName, long activityId, DateTime timeStamp ,CancellationToken token = default);

  #endregion
}