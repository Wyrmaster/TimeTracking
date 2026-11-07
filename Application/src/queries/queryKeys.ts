import type {IStatisticsFilter} from '../network/intents/statistics/statisticsFilter.ts';

/**
 * Keys of the cached api data, the first element of each key groups related queries for invalidation
 */
export const queryKeys = {
  timeEntries: ['timeEntries'] as const,
  timeEntriesOfRange: (from: string, to: string) => ['timeEntries', from, to] as const,
  activeActivity: ['activeActivity'] as const,
  activities: ['activities'] as const,
  activitiesOfWorkspace: (workspaceId: number|null) => ['activities', workspaceId] as const,
  workspaces: ['workspaces'] as const,
  statistics: ['statistics'] as const,
  statisticsOfFilter: (filter: IStatisticsFilter) => ['statistics', filter] as const,
  trackingState: ['trackingState'] as const,
};

/**
 * Queries depending on the tracked time, refreshed whenever tracking changes
 */
export const trackingDependentKeys = [
  queryKeys.timeEntries,
  queryKeys.activeActivity,
  queryKeys.statistics,
];
