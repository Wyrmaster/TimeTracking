import {Intent} from '../../intent.ts';
import type {ITimeEntryDto} from './timeEntryDto.ts';
import {HttpMethod} from '../../httpMethod.ts';
import type {DateValue} from '@internationalized/date';
import {getStartOfDay} from '../../../common/timeGrid.ts';

/**
 * Intent to get the time entries overlapping the given days.
 *
 * The days are sent as the exact instants of their local start and end, so the server does not
 * need to know the time zone of the user.
 */
export class GetTimeEntryIntent extends Intent<ITimeEntryDto[]> {

  // region Constructor

  constructor(from: DateValue, to: DateValue, workspaceId: number|null = null) {
    const end: Date = getStartOfDay(to);
    end.setDate(end.getDate() + 1);

    super(
      `/api/v1/timetracking/${workspaceId == null ? '' : `${workspaceId}/`}${Intent.createQuery([
        {key: 'from', values: [getStartOfDay(from).toISOString()]},
        {key: 'to', values: [end.toISOString()]},
      ])}`,
      HttpMethod.GET,
    );
  }

  // endregion

}
