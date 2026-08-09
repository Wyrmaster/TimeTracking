namespace TimeTracking.Service.Dto.Data.Statistics;

public record StatisticTimeEntryDto
(
  string ActivityName,
  int Color,
  DateTime Date,
  long Duration
);