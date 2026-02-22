import {Intent} from '../../Intent.ts';
import {HttpMethod} from '../../HttpMethod.ts';

/**
 * Intent used to remove a time entry
 */
export class RemoveTimeEntryIntent extends Intent<void> {

  // region Constructor

  constructor(timeEntryId: number) {
    super(`/api/v1/timetracking/${timeEntryId}/`, HttpMethod.DELETE);
  }

  // endregion

}