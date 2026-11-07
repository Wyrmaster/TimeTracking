import {useMutation, useQuery} from '@tanstack/react-query';
import type {DateValue} from '@internationalized/date';
import {useApi} from '../providers/apiContext.ts';
import {queryKeys, trackingDependentKeys} from './queryKeys.ts';
import {useInvalidate} from './useInvalidate.ts';
import type {ITimeEntryDto} from '../network/intents/timeEntry/timeEntryDto.ts';
import {GetTimeEntryIntent} from '../network/intents/timeEntry/getTimeEntryIntent.ts';
import {AddTimeEntryIntent} from '../network/intents/timeEntry/addTimeEntryIntent.ts';
import {UpdateTimeTrackingIntent} from '../network/intents/timeEntry/updateTimeTrackingIntent.ts';
import {RemoveTimeEntryIntent} from '../network/intents/timeEntry/removeTimeEntryIntent.ts';

/**
 * The time entries overlapping the given days of the active workspace
 * @param days The days to load the time entries for.
 */
export const useTimeEntries = (days: DateValue[]) => {
  const {requestAsync} = useApi();

  const from: DateValue|undefined = days[0];
  const to: DateValue|undefined = days[days.length - 1];

  return useQuery({
    queryKey: queryKeys.timeEntriesOfRange(from?.toString() ?? '', to?.toString() ?? ''),
    queryFn: () => requestAsync(new GetTimeEntryIntent(from!, to!)),
    enabled: from != undefined && to != undefined,
    meta: {errorMessage: 'Failed to load time entries...'},
  });
};

/**
 * Adds a time entry manually
 */
export const useAddTimeEntry = () => {
  const {requestAsync} = useApi();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (timeEntry: ITimeEntryDto) => requestAsync(new AddTimeEntryIntent(timeEntry)),
    onSuccess: () => invalidate(trackingDependentKeys),
    meta: {
      successMessage: 'Successfully created a new time entry...',
      errorMessage: 'Failed to create a new time entry...',
    },
  });
};

/**
 * Updates the timestamps, the description or the activity of a time entry
 */
export const useUpdateTimeEntry = () => {
  const {requestAsync} = useApi();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (timeEntry: ITimeEntryDto) => requestAsync(new UpdateTimeTrackingIntent(timeEntry)),
    onSuccess: () => invalidate(trackingDependentKeys),
    meta: {
      successMessage: 'Successfully updated a time entry...',
      errorMessage: 'Failed to update a time entry...',
    },
  });
};

/**
 * Removes a time entry, which may also be the one currently tracked
 */
export const useRemoveTimeEntry = () => {
  const {requestAsync} = useApi();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (timeEntryId: number) => requestAsync(new RemoveTimeEntryIntent(timeEntryId)),
    onSuccess: () => invalidate(trackingDependentKeys),
    meta: {
      successMessage: 'Successfully removed a time entry...',
      errorMessage: 'Failed to remove a time entry...',
    },
  });
};
