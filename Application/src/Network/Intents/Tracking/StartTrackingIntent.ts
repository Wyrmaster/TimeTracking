import {BodyIntent} from '../../BodyIntent.ts';
import {ITrackingDto} from './ITrackingDto.ts';
import {HttpMethod} from '../../HttpMethod.ts';

/**
 * Represents an intent to start tracking an activity using the time tracking API.
 * The StartTrackingIntent class is designed to initialize and send a POST request
 * to start tracking a specific activity by providing the necessary parameters.
 *
 * Extends the BodyIntent class with a response type of void and a request type of ITrackingDto.
 *
 * @class StartTrackingIntent
 *
 * @param {number} activityId - The identifier of the activity to be tracked.
 * @param {string} description - A brief description associated with the activity being tracked.
 *
 * Inherits functionality from the BodyIntent base class, leveraging its mechanism for
 * constructing and managing HTTP requests.
 */
export class StartTrackingIntent extends BodyIntent<void, ITrackingDto>{

  // region Constructor

  constructor(activityId: number, description: string) {
    super({activityId, description}, `/api/v1/timetracking/startTracking/`, HttpMethod.POST);
  }


  // endregion

}