namespace TimeTracking.Service.Dto.Data.Statistics;

public record StatisticTimeEntryDto
(
  string ActivityName,
  int Color,
  DateTime Start,
  DateTime End,
  long Duration
);