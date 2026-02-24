import * as React from 'react';
import {useContext, useEffect, useState} from 'react';
import {IChildren} from '../Interfaces/IChildren.ts';
import {IResponse} from '../Network/IResponse.ts';
import {IActiveActivityDto} from '../Network/Intents/Activities/IActiveActivityDto.ts';
import {useApi} from './ApiProvider.tsx';
import {GetActiveActivityIntent} from '../Network/Intents/Activities/GetActiveActivityIntent.ts';
import {StartTrackingIntent} from '../Network/Intents/Tracking/StartTrackingIntent.ts';
import {StopTrackingIntent} from '../Network/Intents/Tracking/StopTrackingIntent.ts';
import {IActivityDto} from '../Network/Intents/Activities/IActivityDto.ts';
import {GetActivitiesIntent} from '../Network/Intents/Activities/GetActivitiesIntent.ts';
import {DateValue, getDayOfWeek, parseDate} from '@internationalized/date';
import {settings} from '../Common/Settings.ts';
import {ITimeEntryDto} from '../Network/Intents/TimeEntry/ITimeEntryDto.ts';
import {GetTimeEntryIntent} from '../Network/Intents/TimeEntry/GetTimeEntryIntent.ts';
import {RemoveTimeEntryIntent} from '../Network/Intents/TimeEntry/RemoveTimeEntryIntent.ts';
import {AddTimeEntryIntent} from '../Network/Intents/TimeEntry/AddTimeEntryIntent.ts';
import {UpdateTimeTrackingIntent} from '../Network/Intents/TimeEntry/UpdateTimeTrackingIntent.ts';
import {PostActivityIntent} from '../Network/Intents/Activities/PostActivityIntent.ts';
import {PutActivityIntent} from '../Network/Intents/Activities/PutActivityIntent.ts';
import {RemoveActivityIntent} from '../Network/Intents/Activities/RemoveActivityIntent.ts';
import {addToast} from '@heroui/react';

// region Interface

export interface IActivityContext {
  activeActivity: IActiveActivityDto|null;
  setActiveActivity: (activityId: IActiveActivityDto|null) => void;
  startTracking: (activityId: number) => Promise<void>;
  stopTracking: () => Promise<void>;

  loadActivities: (workspaceId: number|null, setLoading: (state: boolean) => void, setActivities: (activities: IActivityDto[]) => void) => Promise<void>;
  addActivity: (activity: IActivityDto, workspaceId: number) => Promise<void>;
  updateActivity: (activity: IActivityDto, workspaceId: number) => Promise<void>;
  removeActivity: (activityId: number) => Promise<void>;

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
  removeTimeEntry: (timeEntryId: number) => Promise<void>;
}

// endregion

// region Context

const ActivityContext: React.Context<IActivityContext|null> = React.createContext<IActivityContext|null>(null);

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

  const [date, setDate] = useState<DateValue>(parseDate(getDateString(new Date())));
  const [useWorkWeek, setUseWorkWeek] = useState<boolean>(settings.GetUseWorkWeek());
  const [timeEntries, setTimeEntries] = useState<ITimeEntryDto[]>([]);
  const [weekDays, setWeekDays] = useState<DateValue[]>(generateWeekDays(date));
  const [newTimeEntry, setNewTimeEntry] = useState<ITimeEntryDto|null>(null);

  useEffect(() => {
    loadTimeEntries().then();
    fetchActiveActivity().then();
  }, []);

  useEffect(() => {
    settings.SetUseWorkWeek(useWorkWeek);
    setWeekDays(generateWeekDays(date));
  }, [useWorkWeek, date]);

  useEffect(() => {
    loadTimeEntries().then();
  }, [weekDays]);

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

    const response: IResponse<ITimeEntryDto[]> = await sendRequestAsync(new GetTimeEntryIntent(weekDays[0], weekDays[weekDays.length - 1]));

    if (response.code !== 200) {
      addToast({title:'Loading Failure', description:'Failed to load time entries...', color:'danger'});
      return;
    }
    else {
      setTimeEntries(response.response as ITimeEntryDto[]);
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
  const fetchActiveActivity = async () => {
    const response: IResponse<IActiveActivityDto|null> = await sendRequestAsync(new GetActiveActivityIntent());

    if (response.code == 200 || response.code == 204) {
      setActiveActivity(response.response);
    }
    else {
      addToast({title:'Loading Failure', description:'Failed to fetch the active activity...', color:'danger'});
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
      await Promise.all
      (
        [
          fetchActiveActivity(),
          loadTimeEntries(),
        ]
      )
      addToast({title:'Started Tracking', color:'default'});
    }
    else {
      addToast({title:'Tracking Failure', description:'Failed to start tracking...', color:'danger'});
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
  const stopTracking = async () => {
    const response: IResponse<void> = await sendRequestAsync(new StopTrackingIntent());

    if (response.code == 200) {
      setActiveActivity(null);
      await loadTimeEntries();
      addToast({title:'Stopped Tracking', color:'default'});
    }
    else {
      addToast({title:'Tracking Failure', description:'Failed to stop tracking...', color:'danger'});
    }
  };

  /**
   * Asynchronously loads the activities for the selected workspace.
   */
  const loadActivities = async (workspaceId: number|null, setLoading: (state: boolean) => void, setActivities: (activities: IActivityDto[]) => void) => {
    setLoading(true);

    const res: IResponse<IActivityDto[]> = await sendRequestAsync(new GetActivitiesIntent(workspaceId));
    if (res.code == 200) {
      setActivities(res.response ?? []);
    }
    else {
      addToast({title:'Loading Failure', description:'Failed to activities...', color:'danger'});
    }

    setLoading(false);
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
      addToast({title:'Created', description:'Successfully created a new time entry...', color:'success'});
    }
    else {
      addToast({title:'Creation Failure', description:'Failed to create a new time entry...', color:'danger'});
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
      addToast({title:'Updated', description:'Successfully updated a time entry...', color:'success'});
    }
    else {
      addToast({title:'Update Failure', description:'Failed to update a time entry...', color:'danger'});
    }
  }

  /**
   * Asynchronously removes an existing time entry from the server.
   * @param timeEntryId - The ID of the time entry to be removed.
   */
  const removeTimeEntry = async (timeEntryId: number) => {
    const response: IResponse<void> = await sendRequestAsync(new RemoveTimeEntryIntent(timeEntryId));

    if (response.code == 200) {
      await loadTimeEntries();
      addToast({title:'Removed', description:'Successfully removed a time entry...', color:'success'});
    }
    else {
      addToast({title:'Removal Failure', description:'Failed to remove a time entry...', color:'danger'});
    }
  }

  /**
   * Creates a new time entry object with the given start and end date.
   * @param activity - The activity to be associated with the time entry.
   * @param workspaceId - The ID of the workspace to which the activity belongs.
   */
  const addActivity = async (activity: IActivityDto, workspaceId: number) => {
    const response: IResponse<void> = await sendRequestAsync(new PostActivityIntent(activity, workspaceId));
    if (response.code == 200) {
      addToast({title:'Created', description:'Successfully added a new activity...', color:'success'});
    }
    else {
      addToast({title:'Creation Failure', description:'Failed to create a new activity...', color:'danger'});
    }
  }

  /**
   * Updates an existing activity on the server.
   * @param activity - The activity to be updated.
   * @param workspaceId - The ID of the workspace to which the activity belongs.
   */
  const updateActivity = async (activity: IActivityDto, workspaceId: number) => {
    const response: IResponse<void> = await sendRequestAsync(new PutActivityIntent(activity, workspaceId));
    if (response.code == 200) {
      addToast({title:'Updated', description:'Successfully updated an activity...', color:'success'});
    }
    else {
      addToast({title:'Update Failure', description:'Failed to update an activity...', color:'danger'});
    }
  }

  /**
   * Removes an existing activity from the server.
   * @param activityId - The ID of the activity to be removed.
   */
  const removeActivity = async (activityId: number) => {
    const response: IResponse<void> = await sendRequestAsync(new RemoveActivityIntent(activityId));
    if (response.code == 200) {
      addToast({title:'Removed', description:'Successfully removed an activity...', color:'success'});
    }
    else {
      addToast({title:'Removal Failure', description:'Failed to remove an activity...', color:'danger'});
    }
  }

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
      removeActivity
    }}>
      {children}
    </ActivityContext.Provider>
  </>
};

// endregion