namespace TimeTracking.Service.Dto.Data.Statistics;

public record StatisticsDto
(
  IEnumerable<StatisticTimeEntryDto> TimeEntries,
  IEnumerable<StatisticActivityDto> Statistics
);