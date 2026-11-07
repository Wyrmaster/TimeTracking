import {BodyIntent} from '../../bodyIntent.ts';
import type {ITimeEntryDto} from './timeEntryDto.ts';
import {HttpMethod} from '../../httpMethod.ts';

/**
 * Intent used to add a time entry
 */
export class AddTimeEntryIntent extends BodyIntent<void, ITimeEntryDto>{

  // region Constructor

  constructor(timeEntry: ITimeEntryDto) {
    super(timeEntry,`/api/v1/timetracking/`, HttpMethod.POST);
  }

  // endregion

}