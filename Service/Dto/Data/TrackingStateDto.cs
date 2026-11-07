namespace TimeTracking.Service.Dto.Data;

/// <summary>
///   Transfer object describing the current tracking state of a user, used to cheaply detect changes
/// </summary>
/// <param name="Version">Fingerprint of the tracking state, changes whenever tracking starts or stops or time entries are added or removed</param>
/// <param name="ActiveActivityId">Id of the activity that is currently tracked, null if nothing is tracked</param>
public record TrackingStateDto
(
  string Version,
  long? ActiveActivityId
);
