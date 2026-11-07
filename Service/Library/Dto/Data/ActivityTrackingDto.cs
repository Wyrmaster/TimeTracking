namespace TimeTracking.Service.Dto.Data;

/// <summary>
///   Transfer object describing which activity is tracked after a tracking change
/// </summary>
/// <param name="ActivityId">Id of the tracked activity, 0 if nothing is tracked</param>
/// <param name="Timestamp">Timestamp of the tracking change</param>
public record ActivityTrackingDto
(
  long ActivityId,
  DateTime Timestamp
);
