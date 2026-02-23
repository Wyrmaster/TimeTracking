import {Intent} from '../../Intent.ts';
import {IWorkspaceDto} from './IWorkspaceDto.ts';
import {HttpMethod} from '../../HttpMethod.ts';
import {ResponseCallback} from '../../../Types/ResponseCallback.ts';

/**
 * Intent used to get the current workspaces
 */
export class GetWorkspacesIntent extends Intent<IWorkspaceDto[]> {

  // region Constructor

  constructor(offset: number = 0, count: number = 50 ,callback: ResponseCallback<IWorkspaceDto[]> = null) {
    super(`/api/v1/workspace?offset=${offset}&count=${count}`, HttpMethod.GET, callback);
  }

  // endregion

}