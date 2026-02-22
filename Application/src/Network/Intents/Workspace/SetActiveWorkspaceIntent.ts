import {Intent} from '../../Intent.ts';
import {HttpMethod} from '../../HttpMethod.ts';

/**
 * Intent used to set the active workspace
 */
export class SetActiveWorkspaceIntent extends Intent<void> {

  // region Constructor

  constructor(workspaceId: number) {
    super(`/api/v1/workspace/activate/${workspaceId}`, HttpMethod.PUT);
  }

  // endregion

}