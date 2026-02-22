import {Intent} from '../../Intent.ts';
import {HttpMethod} from '../../HttpMethod.ts';

/**
 * Represents an intent to stop time tracking by sending a request
 * to the specified endpoint.
 *
 * This class is a specific implementation of the `Intent` base class
 * and is designed to handle operations related to stopping the time
 * tracking process.
 *
 * Extends:
 * - `Intent<void>`: The base class that provides the structure for building
 *   and managing API requests.
 *
 * Responsibilities:
 * - Defines the endpoint and HTTP method needed to stop time tracking.
 * - Leverages the `Intent` base class to encapsulate the request's
 *   logic and behavior.
 */
export class StopTrackingIntent extends Intent<void>{

  // region Constructor

  constructor() {
    super(`/api/v1/timetracking/stopTracking/`, HttpMethod.POST);
  }

  // endregion

}