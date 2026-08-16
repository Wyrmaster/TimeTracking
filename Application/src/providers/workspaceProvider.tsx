import {createContext, useContext, useEffect, useState} from 'react';
import {useApi} from './apiProvider.tsx';
import type {IWorkspaceDto} from '../network/intents/workspace/workspaceDto.ts';
import type {IChildren} from '../interfaces/children.ts';
import {GetWorkspacesIntent} from '../network/intents/workspace/getWorkspacesIntent.ts';
import type {IResponse} from '../network/response.ts';
import {AddWorkspaceIntent} from '../network/intents/workspace/addWorkspaceIntent.ts';
import {UpdateWorkspaceIntent} from '../network/intents/workspace/updateWorkspaceIntent.ts';
import {RemoveWorkspaceIntent} from '../network/intents/workspace/removeWorkspaceIntent.ts';
import {SetActiveWorkspaceIntent} from '../network/intents/workspace/setActiveWorkspaceIntent.ts';
import {toaster} from '../components/ui/toaster.tsx';


// region Interface

export interface IWorkspaceContext {
  workspaces: IWorkspaceDto[];

  loadWorkspaces: () => void;

  addWorkspace: (workspace: IWorkspaceDto) => void;
  updateWorkspace: (workspace: IWorkspaceDto) => void;
  removeWorkspace: (workspaceId: number) => void;
  setActiveWorkspace: (workspaceId: number) => void;
}

// endregion

// region Context

const WorkspaceContext = createContext<IWorkspaceContext|null>(null);

export const useWorkspace = () => {
  const context: IWorkspaceContext|null = useContext(WorkspaceContext);
  if (context == null) {
    throw new Error('useWorkspace must be used within the WorkspaceProvider');
  }

  return context;
};

// endregion

// region Provider

/**
 * WorkspaceProvider is a React component that provides workspace management functionality
 * through the WorkspaceContext. It allows loading, adding, updating, removing, and setting
 * an active workspace using API requests.
 *
 * @param {IChildren} props - The children components to be wrapped by the provider.
 *
 * @returns {JSX.Element} A React context provider for workspace-related operations.
 *
 * @property {Array<IWorkspaceDto>} workspaces - The list of loaded workspaces.
 * @property {Function} loadWorkspaces - Asynchronously fetches and updates the list of workspaces.
 * @property {Function} addWorkspace - Adds a new workspace and updates the workspace list.
 * @property {Function} updateWorkspace - Updates an existing workspace and refreshes the workspace list.
 * @property {Function} removeWorkspace - Removes a workspace by its ID and refreshes the workspace list.
 * @property {Function} setActiveWorkspace - Sets a workspace as active and refreshes the workspace list.
 */
export const WorkspaceProvider = ({children}: IChildren) => {

  const { sendRequestAsync } = useApi();
  const [workspaces, setWorkspaces] = useState<IWorkspaceDto[]>([]);

  /**
   * Fetches and updates the list of workspaces from the API.
   */
  const loadWorkspaces = () => {
    sendRequestAsync(new GetWorkspacesIntent())
      .then(res => {
        if (res.code == 200){
          setWorkspaces(res.response ?? []);
        }
        else {
          toaster.create({ description:'Failed to load workspaces...', type:'error'});
        }
      });
  }

  /**
   * Adds a new workspace to the list of workspaces and updates the API.
   * @param workspace - The workspace to be added.
   */
  const addWorkspace = async (workspace: IWorkspaceDto) => {
    const response: IResponse<void> = await sendRequestAsync(new AddWorkspaceIntent(workspace));
    if (response.code == 200){
      loadWorkspaces();
      toaster.create({ description:'Successfully created a new workspace...', type:'success'});
    }
    else {
      toaster.create({ description:'Failed to create a new workspace...', type:'error'});
    }
  }

  /**
   * Updates an existing workspace in the list of workspaces and updates the API.
   * @param workspace - The workspace to be updated.
   */
  const updateWorkspace = async (workspace: IWorkspaceDto) => {
    const response: IResponse<void> = await sendRequestAsync(new UpdateWorkspaceIntent(workspace));
    if (response.code == 200){
      loadWorkspaces();
      toaster.create({ description:'Successfully updated a workspace...', type:'success'});
    }
    else {
      toaster.create({ description:'Failed to update a workspace...', type:'error'});
    }
  }

  /**
   * Removes a workspace from the list of workspaces and updates the API.
   * @param workspaceId - The ID of the workspace to be removed.
   */
  const removeWorkspace = async (workspaceId: number) => {
    const response: IResponse<void> = await sendRequestAsync(new RemoveWorkspaceIntent(workspaceId));
    if (response.code == 200){
      loadWorkspaces();
      toaster.create({ description:'Successfully removed a workspace...', type:'success'});
    }
    else {
      toaster.create({ description:'Failed to remove a workspace...', type:'error'});
    }
  }

  /**
   * Sets a workspace as active and updates the API.
   * @param workspaceId - The ID of the workspace to be set as active.
   */
  const setActiveWorkspace = async (workspaceId: number) => {
    const response: IResponse<void> = await sendRequestAsync(new SetActiveWorkspaceIntent(workspaceId));
    if (response.code == 200){
      loadWorkspaces();
      toaster.create({ description:'Successfully activated a new active workspace...', type:'success'});
    }
    else {
      toaster.create({ description:'Failed to activate a workspace...', type:'error'});
    }
  }

  useEffect(() => {
    loadWorkspaces();
  }, []);

  return <>
    <WorkspaceContext.Provider value={{
      workspaces,
      loadWorkspaces,
      addWorkspace,
      updateWorkspace,
      removeWorkspace,
      setActiveWorkspace,
    }}>
      {children}
    </WorkspaceContext.Provider>
  </>
};

// endregion