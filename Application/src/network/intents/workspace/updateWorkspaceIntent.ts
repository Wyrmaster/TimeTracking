import {BodyIntent} from '../../bodyIntent.ts';
import type {IWorkspaceDto} from './workspaceDto.ts';
import {HttpMethod} from '../../httpMethod.ts';

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