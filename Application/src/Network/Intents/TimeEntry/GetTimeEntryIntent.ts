import {Intent} from '../../Intent.ts';
import {ITimeEntryDto} from './ITimeEntryDto.ts';
import {HttpMethod} from '../../HttpMethod.ts';
import {DateValue} from '@internationalized/date';

const toDateString = (date: DateValue) =>
  `${date.year}`
  + `-${date.month.toString().padStart(2, '0')}`
  + `-${date.day.toString().padStart(2, '0')}`;

export class GetTimeEntryIntent extends Intent<ITimeEntryDto[]>{
  constructor(from: DateValue, to: DateValue, workspaceId?: number | null) {
    super(
      `/api/v1/timetracking/${workspaceId ? `${workspaceId}/` : ''}?from=${toDateString(from)}&to=${toDateString(to)}`,
      HttpMethod.GET
    );
  }
}