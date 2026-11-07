import {Intent} from '../../intent.ts';
import type {IStatisticsDto} from './statisticsDto.ts';
import {HttpMethod} from '../../httpMethod.ts';
import {type IStatisticsFilter, toStatisticsQuery} from './statisticsFilter.ts';

/**
 * Intent to get statistics.
 */
export class GetStatisticsIntent extends Intent<IStatisticsDto> {
  constructor(filter: IStatisticsFilter) {
    super(
      `/api/v1/statistics/${Intent.createQuery(toStatisticsQuery(filter))}`,
      HttpMethod.GET,
    );
  }
}
