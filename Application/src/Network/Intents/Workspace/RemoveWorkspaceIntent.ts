import {Intent} from '../../Intent.ts';
import {HttpMethod} from '../../HttpMethod.ts';

/**
 * Intent used to remove a workspace
 */
export class RemoveWorkspaceIntent extends Intent<void> {

  // region Constructor

  constructor(workspaceId: number) {
    super(`/api/v1/workspace/${workspaceId}`, HttpMethod.DELETE);
  }

  // endregion

}