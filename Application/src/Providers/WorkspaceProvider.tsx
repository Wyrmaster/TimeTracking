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

export const WorkspaceProvider = ({children}: IChildren) => {

  const { sendRequestAsync } = useApi();
  const [workspaces, setWorkspaces] = useState<IWorkspaceDto[]>([]);

  useEffect(() => {
    loadWorkspaces().then();
  }, []);

  const loadWorkspaces = async () => {
    const res = await sendRequestAsync(new GetWorkspacesIntent());
    if (res.code == 200){
      setWorkspaces(res.response ?? []);
    }
    else {
      addToast({title:'Loading Failure', description:'Failed to load workspaces...', color:'danger'});
    }
  }

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