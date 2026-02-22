import {BodyIntent} from '../../BodyIntent.ts';
import {IWorkspaceDto} from './IWorkspaceDto.ts';
import {HttpMethod} from '../../HttpMethod.ts';

/**
 * Intent used to update a workspace
 */
export class UpdateWorkspaceIntent extends BodyIntent<void, IWorkspaceDto>{

  // region Constructor

  constructor(workspace: IWorkspaceDto) {
    super(workspace,`/api/v1/workspace/${workspace.id}`, HttpMethod.PUT);
  }

  // endregion

}