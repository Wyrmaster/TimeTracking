import {Intent} from '../../intent.ts';
import type {IWorkspaceDto} from './workspaceDto.ts';
import {HttpMethod} from '../../httpMethod.ts';

/**
 * Intent used to get the current workspaces
 */
export class GetWorkspacesIntent extends Intent<IWorkspaceDto[]> {

  // region Constructor

  constructor(offset: number = 0, count: number = 50 ) {
    super(`/api/v1/workspace?offset=${offset}&count=${count}`, HttpMethod.GET);
  }

  // endregion

}