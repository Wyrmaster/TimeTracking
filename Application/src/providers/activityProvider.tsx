import * as React from 'react';
import {useContext, useEffect, useRef, useState} from 'react';
import {useApi} from './apiProvider.tsx';
import {type DateValue, getDayOfWeek, parseDate} from '@internationalized/date';
import type {IActiveActivityDto} from '../network/intents/activities/activeActivityDto.ts';
import type {IActivityDto} from '../network/intents/activities/activityDto.ts';
import type {ITimeEntryDto} from '../network/intents/timeEntry/timeEntryDto.ts';
import type {IChildren} from '../interfaces/children.ts';
import {settings} from '../common/settings.ts';
import type {IResponse} from '../network/response.ts';
import {GetTimeEntryIntent} from '../network/intents/timeEntry/getTimeEntryIntent.ts';
import {GetActiveActivityIntent} from '../network/intents/activities/getActiveActivityIntent.ts';
import {StartTrackingIntent} from '../network/intents/tracking/startTrackingIntent.ts';
import {StopTrackingIntent} from '../network/intents/tracking/stopTrackingIntent.ts';
import {GetActivitiesIntent} from '../network/intents/activities/getActivitiesIntent.ts';
import {AddTimeEntryIntent} from '../network/intents/timeEntry/addTimeEntryIntent.ts';
import {UpdateTimeTrackingIntent} from '../network/intents/timeEntry/updateTimeTrackingIntent.ts';
import {RemoveTimeEntryIntent} from '../network/intents/timeEntry/removeTimeEntryIntent.ts';
import {PostActivityIntent} from '../network/intents/activities/postActivityIntent.ts';
import {PutActivityIntent} from '../network/intents/activities/putActivityIntent.ts';
import {RemoveActivityIntent} from '../network/intents/activities/removeActivityIntent.ts';
import {toaster} from '../components/ui/toaster.tsx';
import {GetTrackingStateIntent} from '../network/intents/tracking/getTrackingStateIntent.ts';

// region Constants

/**
 * Interval in which the tracking state is polled to detect changes made by other clients
 */
const TRACKING_POLL_INTERVAL: number = 15_000;

// endregion

// region Interface

export interface IActivityContext {
  activeActivity: IActiveActivityDto|null;
  setActiveActivity: (activityId: IActiveActivityDto|null) => void;
  startTracking: (activityId: number) => Promise<void>;
  stopTracking: () => Promise<void>;

  loadActivities: (workspaceId: number|null, setLoading?: (state: boolean) => void|null) => Promise<IActivityDto[]>;
  addActivity: (activity: IActivityDto, workspaceId: number) => Promise<boolean>;
  updateActivity: (activity: IActivityDto, workspaceId: number) => Promise<boolean>;
  removeActivity: (activityId: number) => Promise<void>;
  activitiesRevision: number;

  refreshTracking: () => Promise<void>;

  date: DateValue;
  setDate: (date: DateValue) => void;
  useWorkWeek: boolean;
  setUseWorkWeek: (useWorkWeek: boolean) => void;
  timeEntries: ITimeEntryDto[];
  newTimeEntry: ITimeEntryDto|null;
  setNewTimeEntry: (timeEntry: ITimeEntryDto|null) => void;
  weekDays: DateValue[];

  addTimeEntry: (timeEntry: ITimeEntryDto) => Promise<void>;
  updateTimeEntry: (timeEntry: ITimeEntryDto) => Promise<void>;
  removeTimeEntry: (timeEntryId: number) => Promise<boolean>;
}

// endregion

// region Context

const ActivityContext: React.Context<IActivityContext|null> = React.createContext<IActivityContext|null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useActivity = () => {
  const context: IActivityContext|null = useContext(ActivityContext);
  if (context == null) {
    throw new Error('useActiveActivity must be used within the ActiveActivityProvider');
  }

  return context;
}

// endregion

// region Provider

/**
 * Provides activity-related state management and functionality in the application.
 *
 * The ActivityProvider component acts as a context provider that encompasses
 * several stateful and asynchronous functions for managing and interacting with
 * user activities, time entries, and workspace-related data. This includes operations
 * like fetching, adding, updating, and removing time entries, as well as managing
 * active activity tracking and loading associated data.
 *
 * Consumers of the ActivityProvider gain access to its state and functionality, enabling
 * streamlined activity and time entry management throughout the application.
 *
 * The provider initializes its state on mount by loading initial time entries and the
 * active activity. Dependencies such as `useWorkWeek` and selected `date` drive further
 * reactivity and trigger updates to the application state.
 *
 * @param {IChildren} props - The children components wrapped by the provider.
 *                            The children components can consume the provided state
 *                            and functionality via React Context.
 */
export const ActivityProvider = ({children}: IChildren) => {

  const [activeActivity, setActiveActivity] = useState<IActiveActivityDto|null>(null);
  const {sendRequestAsync} = useApi();

  /**
   * Formats a given Date object as a string in the format 'YYYY-MM-DD'.
   *
   * @param {Date} date - The Date object to be formatted.
   * @returns {string} A string representing the date in 'YYYY-MM-DD' format.
   */
  const getDateString = (date: Date): string =>
    `${date.getFullYear()}`
    + `-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    + `-${date.getDate().toString().padStart(2, '0')}`
  ;

  /**
   * Generates an array of date values representing the days of the week based on the provided date.
   *
   * The function calculates the start of the week based on the given date and generates a list of
   * consecutive days. It uses either a 5-day workweek or a 7-day regular week depending on a configuration.
   * The first day of the week is determined by a settings value.
   *
   * @param {DateValue} date - The reference date used to calculate the corresponding week.
   * @returns {DateValue[]} An array of date values representing the days of the associated week.
   */
  const generateWeekDays = (date: DateValue) : DateValue[] => {

    const daysInWeek = useWorkWeek ? 5 : 7;

    // getDayOfWeek: 0 = Sunday ... 6 = Saturday
    const dayOfWeek = getDayOfWeek(date, useWorkWeek ? 'de-DE' : 'en-US');

    const diff =
      (dayOfWeek - settings.GetFirstDayOfTheWeek() + 7) % 7;

    const startOfWeek = date.subtract({ days: diff });

    const week: DateValue[] = [];

    for (let i = 0; i < daysInWeek; i++) {
      week.push(startOfWeek.add({ days: i }));
    }

    return week;
  };

  const [date, setDate] = useState<DateValue>(parseDate(getDateString(new Date())) as unknown as DateValue);
  const [useWorkWeek, setUseWorkWeek] = useState<boolean>(settings.GetUseWorkWeek());
  const [timeEntries, setTimeEntries] = useState<ITimeEntryDto[]>([]);
  const [weekDays, setWeekDays] = useState<DateValue[]>(generateWeekDays(date));
  const [newTimeEntry, setNewTimeEntry] = useState<ITimeEntryDto|null>(null);
  const [activitiesRevision, setActivitiesRevision] = useState<number>(0);

  /**
   * Fetches and loads time entry data for a specified range of weekdays.
   *
   * This asynchronous function retrieves time entry information using an API request,
   * handles the response, and updates the application's state with the retrieved entries.
   *
   * @returns {Promise<void>} A promise that resolves when the function completes execution.
   */
  const loadTimeEntries = async (): Promise<void> => {

    if (weekDays.length === 0) {
      return;
    }

    const r = await sendRequestAsync(new GetTimeEntryIntent(weekDays[0], weekDays[weekDays.length - 1]));

    if (r.code !== 200) {
      toaster.create({ description:'Failed to load time entries...', type:'error'});
      return;
    }
    else {
      setTimeEntries(r.response as ITimeEntryDto[]);
    }
  };

  /**
   * Retrieves the currently active activity asynchronously from the server.
   *
   * This function sends a request using the `GetActiveActivityIntent` to fetch
   * information about the active activity. If the response status code is 200,
   * the active activity is updated.
   *
   * @async
   * @function fetchActiveActivity
   * @returns {Promise<void>} A promise that resolves once the request is completed
   * and the active activity is set.
   */
  const fetchActiveActivity = async (): Promise<void> => {
    const r = await sendRequestAsync(new GetActiveActivityIntent());

    if (r.code == 200 || r.code == 204) {
      setActiveActivity(r.response);
    }
    else {
      toaster.create({ description:'Failed to fetch the active activity...', type:'error'});
    }
  };

  /**
   * Initiates tracking for the specified activity.
   *
   * This asynchronous function sends a request to begin tracking an activity associated with the given activity ID.
   * If the server responds with a success code (200), it triggers fetching of the currently active activity.
   *
   * @param {number} activityId - The ID of the activity to start tracking.
   * @returns {Promise<void>} A promise that resolves once the tracking process is initiated
   *                          and additional actions (if any) are completed.
   */
  const startTracking = async (activityId: number): Promise<void> => {
    const response: IResponse<void> = await sendRequestAsync(new StartTrackingIntent(activityId, ''));

    if (response.code == 200) {
      await fetchActiveActivity();
      await loadTimeEntries();
      toaster.create( {description: 'Started Tracking...', type :'success'});
    }
    else {
      toaster.create({ description:'Failed to start tracking...', type:'error'});
    }
  };

  /**
   * Asynchronously stops the current tracking activity.
   *
   * This function sends a request to stop the currently active tracking process.
   * Upon a successful response with a status code of 200, it clears the active
   * activity state.
   *
   * @async
   * @function
   * @returns {Promise<void>} A promise that resolves when the tracking stop operation completes.
   */
  const stopTracking = async (): Promise<void> => {
    const response: IResponse<void> = await sendRequestAsync(new StopTrackingIntent());

    if (response.code == 200) {
      setActiveActivity(null);
      await loadTimeEntries();
      toaster.create({ description: 'Stopped Tracking', type:'success'});
    }
    else {
      toaster.create({ description:'Failed to stop tracking...', type:'error'});
    }
  };

  /**
   * Asynchronously loads the activities for the selected workspace.
   */
  const loadActivities = async (
    workspaceId: number|null = null,
    setLoading: (state: boolean) => void = () => {}
  ): Promise<IActivityDto[]> => {
    setLoading(true);

    const res = await sendRequestAsync(new GetActivitiesIntent(workspaceId))
    setLoading(false);

    if (res.code == 200) {
      return res.response as IActivityDto[];
    }
    else {
      toaster.create({ description:'Failed to activities...', type:'error'});
    }

    return [];
  };

  /**
   * Asynchronously adds a new time entry to the server.
   * @param timeEntry - The time entry to be added.
   */
  const addTimeEntry = async (timeEntry: ITimeEntryDto) => {
    const response: IResponse<void> = await sendRequestAsync(new AddTimeEntryIntent(timeEntry));
    if (response.code == 200) {
      setNewTimeEntry(null);
      await loadTimeEntries();
      await fetchActiveActivity();
      toaster.create({ description:'Successfully created a new time entry...', type:'success'});
    }
    else {
      toaster.create({ description:'Failed to create a new time entry...', type:'error'});
    }
  }

  /**
   * Asynchronously updates an existing time entry on the server.
   * @param timeEntry - The time entry to be updated.
   */
  const updateTimeEntry = async (timeEntry: ITimeEntryDto) => {
    const response: IResponse<void> = await sendRequestAsync(new UpdateTimeTrackingIntent(timeEntry));
    if (response.code == 200) {
      await loadTimeEntries();
      await fetchActiveActivity();
      toaster.create({ description:'Successfully updated a time entry...', type:'success'});
    }
    else {
      toaster.create({ description:'Failed to update a time entry...', type:'error'});
    }
  }

  /**
   * Asynchronously removes an existing time entry from the server.
   * @param timeEntryId - The ID of the time entry to be removed.
   * @returns whether the time entry was removed.
   */
  const removeTimeEntry = async (timeEntryId: number): Promise<boolean> => {
    const response: IResponse<void> = await sendRequestAsync(new RemoveTimeEntryIntent(timeEntryId));

    if (response.code == 200) {
      await loadTimeEntries();
      // the removed time entry may have been the one currently tracked
      await fetchActiveActivity();
      toaster.create({ description:'Successfully removed a time entry...', type:'success'});
      return true;
    }
    else {
      toaster.create({ description:'Failed to remove a time entry...', type:'error'});
      return false;
    }
  }

  /**
   * Creates a new time entry object with the given start and end date.
   * @param activity - The activity to be associated with the time entry.
   * @param workspaceId - The ID of the workspace to which the activity belongs.
   * @returns whether the activity was added.
   */
  const addActivity = async (activity: IActivityDto, workspaceId: number): Promise<boolean> => {
    const response: IResponse<void> = await sendRequestAsync(new PostActivityIntent(activity, workspaceId));
    if (response.code == 200) {
      toaster.create({ description:'Successfully added a new activity...', type:'success'});
      setActivitiesRevision(revision => revision + 1);
      return true;
    }
    else {
      toaster.create({ description:'Failed to create a new activity...', type:'error'});
      return false;
    }
  }

  /**
   * Updates an existing activity on the server.
   * @param activity - The activity to be updated.
   * @param workspaceId - The ID of the workspace to which the activity belongs.
   * @returns whether the activity was updated.
   */
  const updateActivity = async (activity: IActivityDto, workspaceId: number): Promise<boolean> => {
    const response: IResponse<void> = await sendRequestAsync(new PutActivityIntent(activity, workspaceId));
    if (response.code == 200) {
      toaster.create({ description:'Successfully updated an activity...', type:'success'});
      setActivitiesRevision(revision => revision + 1);
      return true;
    }
    else {
      toaster.create({ description:'Failed to update an activity...', type:'error'});
      return false;
    }
  }

  /**
   * Removes an existing activity from the server.
   * @param activityId - The ID of the activity to be removed.
   */
  const removeActivity = async (activityId: number) => {
    const response: IResponse<void> = await sendRequestAsync(new RemoveActivityIntent(activityId));
    if (response.code == 200) {
      toaster.create({ description:'Successfully removed an activity...', type:'success'});
      setActivitiesRevision(revision => revision + 1);
    }
    else {
      toaster.create({ description:'Failed to remove an activity...', type:'error'});
    }
  }

  /**
   * Reloads everything that may have been changed by other clients, like the time entries of the
   * displayed week and the currently tracked activity.
   */
  const refreshTracking = async (): Promise<void> => {
    await loadTimeEntries();
    await fetchActiveActivity();
  };

  /**
   * Latest version of `refreshTracking`, so the polling interval never uses a stale week.
   */
  const refreshTrackingRef = useRef(refreshTracking);

  /**
   * ETag of the last known tracking state.
   */
  const trackingEtag = useRef<string|null>(null);

  useEffect(() => {
    refreshTrackingRef.current = refreshTracking;
  });

  /**
   * Polls the fingerprint of the tracking state and reloads the time entries and the active
   * activity once it changes, e.g. because another client started tracking.
   *
   * The request is conditional, so an unchanged state is answered with an empty 304. Polling is
   * paused while the page is hidden or no user is signed in.
   */
  useEffect(() => {
    let polling: boolean = false;

    const poll = async () => {
      if (polling || document.visibilityState == 'hidden' || settings.GetToken() == null) {
        return;
      }

      polling = true;
      const response = await sendRequestAsync(new GetTrackingStateIntent(trackingEtag.current));
      polling = false;

      if (response.code != 200 || response.etag == null) {
        return;
      }

      const changed: boolean = trackingEtag.current != null && trackingEtag.current != response.etag;
      trackingEtag.current = response.etag;

      if (changed) {
        await refreshTrackingRef.current();
      }
    };

    const pollWhenVisible = () => {
      if (document.visibilityState == 'visible') {
        poll().then();
      }
    };

    poll().then();
    const handle = setInterval(poll, TRACKING_POLL_INTERVAL);
    document.addEventListener('visibilitychange', pollWhenVisible);

    return () => {
      clearInterval(handle);
      document.removeEventListener('visibilitychange', pollWhenVisible);
    };
  }, []);

  const ignoreInitialRequest = useRef(0);

  useEffect(() => {
    settings.SetUseWorkWeek(useWorkWeek);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWeekDays(generateWeekDays(date));
  }, [useWorkWeek, date]);

  useEffect(() => {
    ignoreInitialRequest.current += 1;
    // three because this is triggered once by weekdays, useworkweek and date
    if (ignoreInitialRequest.current <= 3){
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTimeEntries().then();
  }, [weekDays]);

  return <>
    <ActivityContext.Provider value={{
      activeActivity,
      setActiveActivity: activity => setActiveActivity(activity),
      startTracking,
      stopTracking,
      loadActivities,
      date,
      setDate,
      useWorkWeek,
      setUseWorkWeek,
      timeEntries,
      weekDays,
      updateTimeEntry,
      removeTimeEntry,
      newTimeEntry,
      addTimeEntry,
      setNewTimeEntry: timeEntry => setNewTimeEntry(timeEntry),
      addActivity,
      updateActivity,
      removeActivity,
      activitiesRevision,
      refreshTracking
    }}>
      {children}
    </ActivityContext.Provider>
  </>
};

// endregion