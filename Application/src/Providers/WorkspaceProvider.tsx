import {IWorkspaceDto} from '../Network/Intents/Workspace/IWorkspaceDto.ts';
import {createContext, useContext, useEffect, useState} from 'react';
import {IChildren} from '../Interfaces/IChildren.ts';
import {GetWorkspacesIntent} from '../Network/Intents/Workspace/GetWorkspacesIntent.ts';
import {useApi} from './ApiProvider.tsx';
import {IResponse} from '../Network/IResponse.ts';
import {RemoveWorkspaceIntent} from '../Network/Intents/Workspace/RemoveWorkspaceIntent.ts';
import {UpdateWorkspaceIntent} from '../Network/Intents/Workspace/UpdateWorkspaceIntent.ts';
import {AddWorkspaceIntent} from '../Network/Intents/Workspace/AddWorkspaceIntent.ts';
import {SetActiveWorkspaceIntent} from '../Network/Intents/Workspace/SetActiveWorkspaceIntent.ts';
import {addToast} from '@heroui/react';

// region Interface

export interface IWorkspaceContext {
  workspaces: IWorkspaceDto[];

  loadWorkspaces: () => Promise<void>;

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

  useEffect(() => {
    loadWorkspaces().then();
  }, []);

  /**
   * Fetches and updates the list of workspaces from the API.
   */
  const loadWorkspaces = async () => {
    const res = await sendRequestAsync(new GetWorkspacesIntent());
    if (res.code == 200){
      setWorkspaces(res.response ?? []);
    }
    else {
      addToast({title:'Loading Failure', description:'Failed to load workspaces...', color:'danger'});
    }
  }

  /**
   * Adds a new workspace to the list of workspaces and updates the API.
   * @param workspace - The workspace to be added.
   */
  const addWorkspace = async (workspace: IWorkspaceDto) => {
    const response: IResponse<void> = await sendRequestAsync(new AddWorkspaceIntent(workspace));
    if (response.code == 200){
      await loadWorkspaces();
      addToast({title:'Created', description:'Successfully created a new workspace...', color:'success'});
    }
    else {
      addToast({title:'Creation Failure', description:'Failed to create a new workspace...', color:'danger'});
    }
  }

  /**
   * Updates an existing workspace in the list of workspaces and updates the API.
   * @param workspace - The workspace to be updated.
   */
  const updateWorkspace = async (workspace: IWorkspaceDto) => {
    const response: IResponse<void> = await sendRequestAsync(new UpdateWorkspaceIntent(workspace));
    if (response.code == 200){
      await loadWorkspaces();
      addToast({title:'Updated', description:'Successfully updated a workspace...', color:'success'});
    }
    else {
      addToast({title:'Update Failure', description:'Failed to update a workspace...', color:'danger'});
    }
  }

  /**
   * Removes a workspace from the list of workspaces and updates the API.
   * @param workspaceId - The ID of the workspace to be removed.
   */
  const removeWorkspace = async (workspaceId: number) => {
    const response: IResponse<void> = await sendRequestAsync(new RemoveWorkspaceIntent(workspaceId));
    if (response.code == 200){
      await loadWorkspaces();
      addToast({title:'Removed', description:'Successfully removed a workspace...', color:'success'});
    }
    else {
      addToast({title:'Remove Failure', description:'Failed to remove a workspace...', color:'danger'});
    }
  }

  /**
   * Sets a workspace as active and updates the API.
   * @param workspaceId - The ID of the workspace to be set as active.
   */
  const setActiveWorkspace = async (workspaceId: number) => {
    const response: IResponse<void> = await sendRequestAsync(new SetActiveWorkspaceIntent(workspaceId));
    if (response.code == 200){
      await loadWorkspaces();
      addToast({title:'Set Active', description:'Successfully activated a new active workspace...', color:'success'});
    }
    else {
      addToast({title:'Set Active Failure', description:'Failed to activate a workspace...', color:'danger'});
    }
  }

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