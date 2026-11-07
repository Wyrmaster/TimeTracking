import {useEffect, useRef} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useApi} from '../providers/apiContext.ts';
import {queryKeys, trackingDependentKeys} from './queryKeys.ts';
import {useInvalidate} from './useInvalidate.ts';
import {ApiError} from '../network/apiError.ts';
import type {IActiveActivityDto} from '../network/intents/activities/activeActivityDto.ts';
import {GetActiveActivityIntent} from '../network/intents/activities/getActiveActivityIntent.ts';
import {StartTrackingIntent} from '../network/intents/tracking/startTrackingIntent.ts';
import {StopTrackingIntent} from '../network/intents/tracking/stopTrackingIntent.ts';
import {GetTrackingStateIntent} from '../network/intents/tracking/getTrackingStateIntent.ts';

/**
 * Interval in which the tracking state is polled to detect changes made by other clients
 */
const TRACKING_POLL_INTERVAL: number = 15_000;

/**
 * The activity that is currently tracked, null if nothing is tracked
 */
export const useActiveActivity = () => {
  const {requestAsync} = useApi();

  return useQuery({
    queryKey: queryKeys.activeActivity,
    queryFn: async (): Promise<IActiveActivityDto|null> => await requestAsync(new GetActiveActivityIntent()) ?? null,
    meta: {errorMessage: 'Failed to fetch the active activity...'},
  });
};

/**
 * Starts tracking an activity, the currently tracked one is stopped
 */
export const useStartTracking = () => {
  const {requestAsync} = useApi();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (activityId: number) => requestAsync(new StartTrackingIntent(activityId, '')),
    onSuccess: () => invalidate(trackingDependentKeys),
    meta: {
      successMessage: 'Started Tracking...',
      errorMessage: 'Failed to start tracking...',
    },
  });
};

/**
 * Stops tracking the current activity
 */
export const useStopTracking = () => {
  const {requestAsync} = useApi();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: () => requestAsync(new StopTrackingIntent()),
    onSuccess: () => invalidate(trackingDependentKeys),
    meta: {
      successMessage: 'Stopped Tracking',
      errorMessage: 'Failed to stop tracking...',
    },
  });
};

/**
 * Keeps the tracked time up to date with changes made by other clients, e.g. a dice or a script using the api.
 *
 * Polls a fingerprint of the tracking state while the page is visible and on focus. The request is conditional,
 * so an unchanged state is answered with an empty 304. Once the fingerprint changes, everything depending on the
 * tracked time is fetched again.
 */
export const useTrackingSync = () => {
  const {sendAsync} = useApi();
  const queryClient = useQueryClient();
  const invalidate = useInvalidate();

  const {data: version} = useQuery({
    queryKey: queryKeys.trackingState,
    queryFn: async (): Promise<string> => {
      const known: string|null = queryClient.getQueryData<string>(queryKeys.trackingState) ?? null;
      const response = await sendAsync(new GetTrackingStateIntent(known));

      if (response.code == 304 && known != null) {
        return known;
      }

      if (response.code != 200 || response.etag == null) {
        throw new ApiError(response.code, 'tracking state');
      }

      return response.etag;
    },
    refetchInterval: TRACKING_POLL_INTERVAL,
  });

  const previousVersion = useRef<string|undefined>(undefined);

  useEffect(() => {
    if (version == undefined) {
      return;
    }

    if (previousVersion.current != undefined && previousVersion.current != version) {
      invalidate(trackingDependentKeys).then();
    }

    previousVersion.current = version;
  }, [version, invalidate]);
};
