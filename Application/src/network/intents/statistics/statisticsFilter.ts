/**
 * Filter applied when requesting statistics
 */
export interface IStatisticsFilter {
  workspaceId: number|null;
  startDate: Date|null;
  endDate: Date|null;
  activityIdsToExclude: number[];
}

/**
 * Converts a statistics filter into the query parameters understood by the statistics endpoints.
 * @param filter The filter to convert.
 */
export const toStatisticsQuery = (filter: IStatisticsFilter): {key: string, values: (string|null)[]}[] => [
  {key: 'workspaceId', values: [filter.workspaceId?.toString() ?? null]},
  {key: 'startDate', values: [filter.startDate?.toISOString() ?? null]},
  {key: 'endDate', values: [filter.endDate?.toISOString() ?? null]},
  {key: 'activityIdsToExclude', values: filter.activityIdsToExclude.map(id => id.toString())},
];
