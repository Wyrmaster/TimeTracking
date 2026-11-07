import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {useApi} from '../providers/apiContext.ts';
import {queryKeys} from './queryKeys.ts';
import type {IStatisticsFilter} from '../network/intents/statistics/statisticsFilter.ts';
import {GetStatisticsIntent} from '../network/intents/statistics/getStatisticsIntent.ts';

/**
 * The statistics matching the given filter, the previous statistics stay visible while a new filter loads
 * @param filter The filter applied to the statistics.
 */
export const useStatistics = (filter: IStatisticsFilter) => {
  const {requestAsync} = useApi();

  return useQuery({
    queryKey: queryKeys.statisticsOfFilter(filter),
    queryFn: () => requestAsync(new GetStatisticsIntent(filter)),
    placeholderData: keepPreviousData,
    meta: {errorMessage: 'Failed to load the statistics...'},
  });
};
