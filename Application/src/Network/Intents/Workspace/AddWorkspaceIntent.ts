import {BodyIntent} from '../../BodyIntent.ts';
import {IWorkspaceDto} from './IWorkspaceDto.ts';
import {HttpMethod} from '../../HttpMethod.ts';

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