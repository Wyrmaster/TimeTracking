import {Intent} from '../../intent.ts';
import {HttpMethod} from '../../httpMethod.ts';
import {type IStatisticsFilter, toStatisticsQuery} from './statisticsFilter.ts';

/**
 * Table of the statistics that is exported
 */
export type StatisticsExportType = 'Entries' | 'Summary';

/**
 * Intent to export the statistics as tab separated values.
 */
export class GetStatisticsExportIntent extends Intent<Blob> {
  constructor(filter: IStatisticsFilter, type: StatisticsExportType) {
    super(
      `/api/v1/statistics/export/${Intent.createQuery([
        {key: 'type', values: [type]},
        ...toStatisticsQuery(filter),
      ])}`,
      HttpMethod.GET,
    );
  }
}
