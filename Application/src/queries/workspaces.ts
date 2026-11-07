import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useApi} from '../providers/apiContext.ts';
import {queryKeys} from './queryKeys.ts';
import {useInvalidate} from './useInvalidate.ts';
import type {IWorkspaceDto} from '../network/intents/workspace/workspaceDto.ts';
import {GetWorkspacesIntent} from '../network/intents/workspace/getWorkspacesIntent.ts';
import {AddWorkspaceIntent} from '../network/intents/workspace/addWorkspaceIntent.ts';
import {UpdateWorkspaceIntent} from '../network/intents/workspace/updateWorkspaceIntent.ts';
import {RemoveWorkspaceIntent} from '../network/intents/workspace/removeWorkspaceIntent.ts';
import {SetActiveWorkspaceIntent} from '../network/intents/workspace/setActiveWorkspaceIntent.ts';

/**
 * The workspaces of the user
 */
export const useWorkspaces = () => {
  const {requestAsync} = useApi();

  return useQuery({
    queryKey: queryKeys.workspaces,
    queryFn: () => requestAsync(new GetWorkspacesIntent()),
    meta: {errorMessage: 'Failed to load workspaces...'},
  });
};

/**
 * Adds a workspace
 */
export const useAddWorkspace = () => {
  const {requestAsync} = useApi();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (workspace: IWorkspaceDto) => requestAsync(new AddWorkspaceIntent(workspace)),
    onSuccess: () => invalidate([queryKeys.workspaces]),
    meta: {
      successMessage: 'Successfully created a new workspace...',
      errorMessage: 'Failed to create a new workspace...',
    },
  });
};

/**
 * Updates the name and description of a workspace
 */
export const useUpdateWorkspace = () => {
  const {requestAsync} = useApi();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (workspace: IWorkspaceDto) => requestAsync(new UpdateWorkspaceIntent(workspace)),
    onSuccess: () => invalidate([queryKeys.workspaces]),
    meta: {
      successMessage: 'Successfully updated a workspace...',
      errorMessage: 'Failed to update a workspace...',
    },
  });
};

/**
 * Removes a workspace together with its activities and time entries
 */
export const useRemoveWorkspace = () => {
  const {requestAsync} = useApi();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (workspaceId: number) => requestAsync(new RemoveWorkspaceIntent(workspaceId)),
    onSuccess: () => invalidate([queryKeys.workspaces, queryKeys.activities]),
    meta: {
      successMessage: 'Successfully removed a workspace...',
      errorMessage: 'Failed to remove a workspace...',
    },
  });
};

/**
 * Activates a workspace, which changes the activities and time entries shown everywhere
 */
export const useSetActiveWorkspace = () => {
  const {requestAsync} = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: number) => requestAsync(new SetActiveWorkspaceIntent(workspaceId)),
    onSuccess: () => queryClient.invalidateQueries(),
    meta: {
      successMessage: 'Successfully activated a new active workspace...',
      errorMessage: 'Failed to activate a workspace...',
    },
  });
};
