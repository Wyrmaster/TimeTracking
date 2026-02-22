import {BodyIntent} from '../../BodyIntent.ts';
import {ITimeEntryDto} from './ITimeEntryDto.ts';
import {HttpMethod} from '../../HttpMethod.ts';

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