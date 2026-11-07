import {useMutation, useQuery} from '@tanstack/react-query';
import {useApi} from '../providers/apiContext.ts';
import {queryKeys, trackingDependentKeys} from './queryKeys.ts';
import {useInvalidate} from './useInvalidate.ts';
import type {IActivityDto} from '../network/intents/activities/activityDto.ts';
import {GetActivitiesIntent} from '../network/intents/activities/getActivitiesIntent.ts';
import {PostActivityIntent} from '../network/intents/activities/postActivityIntent.ts';
import {PutActivityIntent} from '../network/intents/activities/putActivityIntent.ts';
import {RemoveActivityIntent} from '../network/intents/activities/removeActivityIntent.ts';

/**
 * Activities are shown with the time entries and statistics, all of them change with an activity
 */
const activityDependentKeys = [
  queryKeys.activities,
  ...trackingDependentKeys,
];

/**
 * The activities of a workspace
 * @param workspaceId The id of the workspace, null for the active workspace.
 */
export const useActivities = (workspaceId: number|null) => {
  const {requestAsync} = useApi();

  return useQuery({
    queryKey: queryKeys.activitiesOfWorkspace(workspaceId),
    queryFn: () => requestAsync(new GetActivitiesIntent(workspaceId)),
    meta: {errorMessage: 'Failed to load activities...'},
  });
};

/**
 * Adds an activity to a workspace
 */
export const useAddActivity = () => {
  const {requestAsync} = useApi();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({activity, workspaceId}: {activity: IActivityDto, workspaceId: number}) =>
      requestAsync(new PostActivityIntent(activity, workspaceId)),
    onSuccess: () => invalidate(activityDependentKeys),
    meta: {
      successMessage: 'Successfully added a new activity...',
      errorMessage: 'Failed to create a new activity...',
    },
  });
};

/**
 * Updates the name, description and color of an activity
 */
export const useUpdateActivity = () => {
  const {requestAsync} = useApi();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (activity: IActivityDto) => requestAsync(new PutActivityIntent(activity, activity.id)),
    onSuccess: () => invalidate(activityDependentKeys),
    meta: {
      successMessage: 'Successfully updated an activity...',
      errorMessage: 'Failed to update an activity...',
    },
  });
};

/**
 * Removes an activity together with its time entries
 */
export const useRemoveActivity = () => {
  const {requestAsync} = useApi();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (activityId: number) => requestAsync(new RemoveActivityIntent(activityId)),
    onSuccess: () => invalidate(activityDependentKeys),
    meta: {
      successMessage: 'Successfully removed an activity...',
      errorMessage: 'Failed to remove an activity...',
    },
  });
};
