using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Dto.Data;

namespace TimeTracking.Service.Interfaces;

/// <summary>
///   Interface describing the currently active side of a dice for each user
/// </summary>
public interface ITimeTrackingService
{
  #region Methods

  /// <summary>
  ///   set memorize the current active side of the dice
  /// </summary>
  /// <param name="username">username of the registered user</param>
  /// <param name="sideId">side id of the active side</param>
  /// <param name="cancellationToken"></param>
  Task SetSideIdAsync(string username, int sideId, CancellationToken cancellationToken = default);

  /// <summary>
  ///   Get the current side id for the queried user
  /// </summary>
  /// <param name="username">name of a user</param>
  /// <param name="cancellationToken"></param>
  /// <returns></returns>
  Task<byte?> GetSideIdAsync(string username, CancellationToken cancellationToken = default);

  /// <summary>
  ///   Store the current charge of the dice of a specific user
  /// </summary>
  /// <param name="username">name of a user</param>
  /// <param name="charge">charge level</param>
  /// <param name="cancellationToken"></param>
  Task SetChargeAsync(string username, int charge, CancellationToken cancellationToken = default);

  /// <summary>
  ///   Returns the current charge level of the dice of a specific user
  /// </summary>
  /// <param name="username">name of the user</param>
  /// <param name="cancellationToken"></param>
  /// <returns>current charge level</returns>
  Task<int> GetChargeAsync(string username, CancellationToken cancellationToken = default);

  /// <summary>
  ///   Retrieves a collection of time entries based on the specified filters.
  /// </summary>
  /// <param name="userName">The username of the user whose time entries are being retrieved.</param>
  /// <param name="workspaceId">The optional workspace ID to filter the time entries.</param>
  /// <param name="offset">The number of entries to skip in the result set.</param>
  /// <param name="count">The maximum number of entries to retrieve.</param>
  /// <param name="from">The optional start date to filter time entries.</param>
  /// <param name="to">The optional end date to filter time entries.</param>
  /// <param name="activities">An optional array of activity IDs to filter the time entries.</param>
  /// <param name="token">The cancellation token to cancel the operation if needed.</param>
  /// <returns>collection of <see cref="TimeEntry"/> objects</returns>
  Task<IEnumerable<TimeEntryDto>> GetTimeEntriesAsync
  (
    string userName,
    long? workspaceId = null,
    int offset = 0,
    int count = int.MaxValue,
    DateTime? from = null,
    DateTime? to = null,
    long[]? activities = null,
    CancellationToken token = default
  );

  /// <summary>
  ///   Starts tracking a specific activity for a user.
  /// </summary>
  /// <param name="userName">The username of the user starting the activity.</param>
  /// <param name="startActivityDto">The transfer object containing details about the activity to start.</param>
  /// <param name="token">A token for canceling the operation if needed.</param>
  /// <returns>Returns a boolean indicating whether the activity tracking started successfully.</returns>
  Task<bool> StartTracking(string userName, StartActivityDto startActivityDto, CancellationToken token = default);

  /// <summary>
  ///   Stops the current time tracking activity for the specified user.
  /// </summary>
  /// <param name="userName">The username of the user whose time tracking activity is to be stopped.</param>
  /// <param name="token">A token to observe while waiting for the task to complete.</param>
  /// <returns>Returns a boolean indicating whether the time tracking was successfully stopped.</returns>
  Task<bool> StopTracking(string userName, CancellationToken token = default);

  /// <summary>
  ///   Adds a new time entry for the specified user.
  /// </summary>
  /// <param name="userName">The username of the user for whom the time entry is being added.</param>
  /// <param name="timeEntryDto">The details of the time entry to be added.</param>
  /// <param name="token">A token to monitor for cancellation requests.</param>
  /// <returns>A boolean result indicating whether the operation succeeded.</returns>
  Task<bool> AddTimeEntryAsync(string userName, TimeEntryDto timeEntryDto, CancellationToken token = default);
  
  /// <summary>
  ///   Updates an existing time entry for a specified user.
  /// </summary>
  /// <param name="userName">The username of the user whose time entry is being updated.</param>
  /// <param name="timeEntryDto">The data transfer object containing the updated time entry details.</param>
  /// <param name="token">The cancellation token to observe cancellation requests.</param>
  /// <returns>Returns a boolean indicating whether the operation was successful.</returns>
  Task<bool> UpdateTimeEntryAsync(string userName, TimeEntryDto timeEntryDto, CancellationToken token = default);

  /// <summary>
  ///  Deletes a specific time entry for the given user.
  /// </summary>
  /// <param name="userName">The username of the registered user.</param>
  /// <param name="timeEntryId">The unique identifier of the time entry to be deleted.</param>
  /// <param name="token">The cancellation token to observe while waiting for the task to complete.</param>
  /// <returns>True if the time entry was successfully deleted; otherwise, false.</returns>
  Task<bool> RemoteTimeEntry(string userName, long timeEntryId, CancellationToken token = default);

  #endregion
}