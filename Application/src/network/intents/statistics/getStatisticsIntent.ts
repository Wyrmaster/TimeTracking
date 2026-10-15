import {Intent} from '../../intent.ts';
import type {IStatisticsDto} from './statisticsDto.ts';
import {HttpMethod} from '../../httpMethod.ts';

/**
 * Intent to get statistics.
 */
export class GetStatisticsIntent extends Intent<IStatisticsDto[]> {
  constructor(
    workspaceId: number|null = null,
    startDate: Date|null = null,
    endDate: Date|null = null,
    activityIdsToExclude: number[] = []
  ) {
    super(`/api/v1/statistics/`
      + Intent.CreateQuery([
        { key: 'workspaceId', values: [workspaceId?.toString() ?? null] },
        { key: 'startDate', values: [startDate?.toISOString() ?? null] },
        { key: 'endDate', values: [endDate?.toISOString() ?? null] },
        { key: 'activityIdsToExclude', values: activityIdsToExclude.map(e => e.toString()) },
      ]),
      HttpMethod.GET
    );
  }
}