import {BodyIntent} from '../../bodyIntent.ts';
import type {IWorkspaceDto} from './workspaceDto.ts';
import {HttpMethod} from '../../httpMethod.ts';

/**
 * Intent used to add a workspace
 */
export class AddWorkspaceIntent extends BodyIntent<void, IWorkspaceDto>{

  // region Constructor

  constructor(workspace: IWorkspaceDto) {
    super(workspace,`/api/v1/workspace`, HttpMethod.POST);
  }

  // endregion
}