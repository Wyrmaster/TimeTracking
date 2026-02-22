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
      // todo logging
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

    if (response.code == 200) {
      setActiveActivity(response.response);
    }
    else {
      // todo logging
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
  const startTracking = async (activityId: number) => {
    const response: IResponse<void> = await sendRequestAsync(new StartTrackingIntent(activityId, ''));

    if (response.code == 200) {
      await Promise.all
      (
        [
          fetchActiveActivity(),
          loadTimeEntries(),
        ]
      )
    }
    else {
      // todo logging
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
    }
    else {
      // todo logging
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
      // todo logging
    }

    setLoading(false);
  };

  const addTimeEntry = async (timeEntry: ITimeEntryDto) => {
    const response: IResponse<void> = await sendRequestAsync(new AddTimeEntryIntent(timeEntry));
    if (response.code == 200) {
      setNewTimeEntry(null);
      await loadTimeEntries();
      await fetchActiveActivity();
    }
    else {
      // todo logging
    }
  }

  const updateTimeEntry = async (timeEntry: ITimeEntryDto) => {
    const response: IResponse<void> = await sendRequestAsync(new UpdateTimeTrackingIntent(timeEntry));
    if (response.code == 200) {
      await loadTimeEntries();
      await fetchActiveActivity();
    }
    else {
      // todo logging
    }
  }

  const removeTimeEntry = async (timeEntryId: number) => {
    const response: IResponse<void> = await sendRequestAsync(new RemoveTimeEntryIntent(timeEntryId));

    if (response.code == 200) {
      await loadTimeEntries();
    }
    else {
      // todo logging
    }
  }

  const addActivity = async (activity: IActivityDto, workspaceId: number) => {
    const response: IResponse<void> = await sendRequestAsync(new PostActivityIntent(activity, workspaceId));
    if (response.code != 200) {
      // todo logging
    }
  }

  const updateActivity = async (activity: IActivityDto, workspaceId: number) => {
    const response: IResponse<void> = await sendRequestAsync(new PutActivityIntent(activity, workspaceId));
    if (response.code != 200) {
      // Todo logging
    }
  }

  const removeActivity = async (activityId: number) => {
    const response: IResponse<void> = await sendRequestAsync(new RemoveActivityIntent(activityId));
    if (response.code != 200) {
      // Todo logging
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