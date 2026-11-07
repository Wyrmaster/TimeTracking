import {Intent} from '../../intent.ts';
import {HttpMethod} from '../../httpMethod.ts';
import type {IActivityDto} from './activityDto.ts';

/**
 * Intent to get the activities of a workspace, the active workspace if none is given
 */
export class GetActivitiesIntent extends Intent<IActivityDto[]> {

  // region Constructor

  constructor(workspaceId: number|null, offset: number = 0, count: number = 50) {
    super(
      `/api/v1/activity/${Intent.createQuery([
        {key: 'workspaceId', values: [workspaceId?.toString() ?? null]},
        {key: 'offset', values: [offset.toString()]},
        {key: 'count', values: [count.toString()]},
      ])}`,
      HttpMethod.GET,
    );
  }

  // endregion

}
