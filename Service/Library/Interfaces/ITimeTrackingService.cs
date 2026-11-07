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
  ///   Switches the tracked activity to the one assigned to the given dice side within the active workspace.
  ///   Side 0 or a side without an activity only stops tracking.
  /// </summary>
  /// <param name="username">name of the user</param>
  /// <param name="sideId">side of the dice facing up</param>
  /// <param name="cancellationToken"></param>
  /// <returns>the tracked activity (0 if nothing is tracked) and the timestamp of the switch</returns>
  Task<ActivityTrackingDto> SetSideIdAsync(string username, int sideId, CancellationToken cancellationToken = default);

  /// <summary>
  ///   Resolves the dice side assigned to the currently tracked activity
  /// </summary>
  /// <param name="username">name of the user</param>
  /// <param name="cancellationToken"></param>
  /// <returns>the side id, 0 if nothing is tracked or the activity has no side</returns>
  Task<byte?> GetSideIdAsync(string username, CancellationToken cancellationToken = default);

  /// <summary>
  ///   Retrieves a collection of time entries based on the specified filters.
  /// </summary>
  /// <param name="userName">The username of the user whose time entries are being retrieved.</param>
  /// <param name="workspaceId">The optional workspace ID to filter the time entries.</param>
  /// <param name="offset">The number of entries to skip in the result set.</param>
  /// <param name="count">The maximum number of entries to retrieve.</param>
  /// <param name="from">The optional start of the time range.</param>
  /// <param name="to">The optional end of the time range.</param>
  /// <param name="activities">An optional array of activity IDs to filter the time entries.</param>
  /// <param name="token">The cancellation token to cancel the operation if needed.</param>
  /// <returns>collection of <see cref="TimeEntryDto"/> objects</returns>
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
  ///   Starts tracking an activity of the user, the currently tracked activity is stopped.
  /// </summary>
  /// <param name="userName">The username of the user starting the activity.</param>
  /// <param name="startActivityDto">The transfer object containing details about the activity to start.</param>
  /// <param name="token">A token for canceling the operation if needed.</param>
  /// <returns>false if the activity does not exist or belongs to another user</returns>
  Task<bool> StartTrackingAsync(string userName, StartActivityDto startActivityDto, CancellationToken token = default);

  /// <summary>
  ///   Stops the currently tracked activity of the user. Time entries shorter than a minute are removed.
  /// </summary>
  /// <param name="userName">The username of the user whose time tracking activity is to be stopped.</param>
  /// <param name="token">A token to observe while waiting for the task to complete.</param>
  Task StopTrackingAsync(string userName, CancellationToken token = default);

  /// <summary>
  ///   Stops the currently tracked activity and continues tracking the activity on the same dice side within the
  ///   given workspace. The changes are not saved, so the caller can save them together with the workspace switch.
  /// </summary>
  /// <param name="userName">The username of the user.</param>
  /// <param name="workspace">The workspace that becomes active.</param>
  /// <param name="token"></param>
  /// <returns>the tracked activity (0 if nothing is tracked) and the timestamp of the switch</returns>
  Task<ActivityTrackingDto> SwitchTrackingWorkspaceAsync(string userName, Workspace workspace, CancellationToken token = default);

  /// <summary>
  ///   Adds a new time entry for the specified user.
  /// </summary>
  /// <param name="userName">The username of the user for whom the time entry is being added.</param>
  /// <param name="timeEntryDto">The details of the time entry to be added.</param>
  /// <param name="token">A token to monitor for cancellation requests.</param>
  /// <returns>false if the activity does not exist or belongs to another user</returns>
  Task<bool> AddTimeEntryAsync(string userName, TimeEntryDto timeEntryDto, CancellationToken token = default);

  /// <summary>
  ///   Updates an existing time entry for a specified user.
  /// </summary>
  /// <param name="userName">The username of the user whose time entry is being updated.</param>
  /// <param name="timeEntryDto">The data transfer object containing the updated time entry details.</param>
  /// <param name="token">The cancellation token to observe cancellation requests.</param>
  /// <returns>false if the time entry or the new activity does not exist or belongs to another user</returns>
  Task<bool> UpdateTimeEntryAsync(string userName, TimeEntryDto timeEntryDto, CancellationToken token = default);

  /// <summary>
  ///  Deletes a specific time entry for the given user.
  /// </summary>
  /// <param name="userName">The username of the registered user.</param>
  /// <param name="timeEntryId">The unique identifier of the time entry to be deleted.</param>
  /// <param name="token">The cancellation token to observe while waiting for the task to complete.</param>
  /// <returns>True if the time entry was successfully deleted; otherwise, false.</returns>
  Task<bool> RemoveTimeEntryAsync(string userName, long timeEntryId, CancellationToken token = default);

  /// <summary>
  ///   Resolves a lightweight fingerprint of the tracking state of the given user, allowing clients to detect
  ///   changes made by other clients without loading all time entries.
  /// </summary>
  /// <param name="userName">The username of the registered user.</param>
  /// <param name="token">The cancellation token to observe while waiting for the task to complete.</param>
  /// <returns>The current tracking state of the user.</returns>
  Task<TrackingStateDto> GetTrackingStateAsync(string userName, CancellationToken token = default);

  #endregion
}
