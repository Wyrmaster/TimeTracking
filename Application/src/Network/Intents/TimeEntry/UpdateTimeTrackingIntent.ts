import {BodyIntent} from '../../BodyIntent.ts';
import {ITimeEntryDto} from './ITimeEntryDto.ts';
import {HttpMethod} from '../../HttpMethod.ts';

/**
 * Represents an intent to update an existing time tracking entry.
 * This class is responsible for preparing the request to update
 * a time entry in the time tracking system by sending a PUT request
 * to the specified API endpoint.
 *
 * It extends the base functionality provided by the `BodyIntent` class
 * and includes the time entry details that need to be updated.
 *
 * @template BodyType The type of the request body, which is `void` in this case.
 * @template ResponseType The type of the response body, which is `ITimeEntryDto`.
 */
export class UpdateTimeTrackingIntent extends BodyIntent<void, ITimeEntryDto> {

  // region Constructor

  constructor(timeEntry: ITimeEntryDto) {
    super(timeEntry, `/api/v1/timetracking/`, HttpMethod.PUT);
  }

  // endregion

}