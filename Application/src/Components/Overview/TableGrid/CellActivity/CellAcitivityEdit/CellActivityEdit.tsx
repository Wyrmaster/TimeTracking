import classes from './CellAcitivityEdit.module.scss';
import {ITimeEntryDto} from '../../../../../Network/Intents/TimeEntry/ITimeEntryDto.ts';
import Svg from '../../../../Svg/Svg.tsx';
import {Button, DateInput, Select, SelectItem, Textarea} from '@heroui/react';
import {useActivity} from '../../../../../Providers/ActivityProvider.tsx';
import {useEffect, useRef, useState} from 'react';
import {HexToInt, IntToHex} from '../../../../../Common/Transformer.ts';
import FractionSpinner from '../../../../Activity/FractionSpinner/FractionSpinner.tsx';
import {CalendarDateTime} from '@internationalized/date';
import {IActivityDto} from '../../../../../Network/Intents/Activities/IActivityDto.ts';
import {SharedSelection} from '@heroui/system';


// region Interface

interface IProps {
  timeEntry: ITimeEntryDto;
  popoverClose: () => void;
  newEntry: boolean;
}

// endregion

// region Component

/**
 * A functional component for editing or creating new time-tracking entries.
 *
 * This component provides a user interface for editing an existing time entry or adding a new time entry.
 * It displays UI elements such as activity selection, time inputs, description fields, and actions for
 * saving, updating, or deleting the time-tracking entry.
 *
 * @param {IProps} props - The properties passed to this component.
 * @param {ITimeEntryDto} props.timeEntry - The currently selected time entry being edited.
 * @param {Function} props.popoverClose - Function to close the popover or dialog containing this component.
 * @param {boolean} props.newEntry - Flags whether the component is being used to create a new entry.
 */
const CellActivityEdit = ({ timeEntry, popoverClose, newEntry }: IProps) => {

  const { removeTimeEntry, setNewTimeEntry, addTimeEntry } = useActivity();

  const ref = useRef<HTMLDivElement>(null);

  const { activeActivity, stopTracking, loadActivities, updateTimeEntry } = useActivity();
  const [ activities, setActivities ] = useState<IActivityDto[]>([]);
  const [ currentActivity, setCurrentActivity ] = useState<IActivityDto|null>(null);
  const [ description, setDescription ] = useState<string>(timeEntry.description);

  /**
   * Converts a JavaScript Date object to a CalendarDateTime object.
   * @param date - The JavaScript Date object to convert.
   * @returns A CalendarDateTime object representing the same date and time as the input Date object.
   */
  const getCalendarDateTime = (date: Date): CalendarDateTime =>
    new CalendarDateTime
    (
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    );

  const [startDateTime, setStartDateTime] = useState<CalendarDateTime>(getCalendarDateTime(new Date(timeEntry.start)));
  const [endDateTime, setEndDateTime] = useState<CalendarDateTime|null>(timeEntry ? getCalendarDateTime(new Date(timeEntry.end ?? new Date().getTime())) : null);

  useEffect(() => {
    loadActivities(null, _ => {}, a => {
      setActivities(a);
      setCurrentActivity(a.find(a => a.id == timeEntry.activity?.id) ?? (a.length > 0 ? a[0] : null));
    }).then();
  }, []);

  // a bit ridiculous but unfortunately I've not yet found a better way to set the background color of the popover
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const popover: HTMLElement = ref.current.parentElement as HTMLElement;

    popover.style.backgroundColor = IntToHex(timeEntry.activity?.activityColor  ?? HexToInt('#006FEE'));
  }, [ref]);

  useEffect(() => {
    if (!ref.current || !currentActivity) {
      return;
    }

    const popover: HTMLElement = ref.current.parentElement as HTMLElement;

    popover.style.backgroundColor = IntToHex(currentActivity.activityColor);
  }, [currentActivity]);

  /**
   * Generates a unique key for an activity based on its ID.
   * @param activityId - The ID of the activity.
   * @returns A string representing the unique key for the activity.
   */
  const generateActivityKey = (activityId: number) => `activity_${activityId}`;

  /**
   * Updates the currently selected activity based on the provided keys.
   * Prevents deselection of the current activity if no keys are provided.
   *
   * @param {SharedSelection} keys - The selection keys representing the currently selected activities.
   */
  const handleActivityChange = (keys: SharedSelection) => {
    const entries = Array.from(keys);
    // prevent deselection of the current activity
    if (entries.length == 0) {
      return;
    }

    const activity = activities.find(a => generateActivityKey(a.id) == entries[0]);
    if (activity) {
      setCurrentActivity(activity);
    }
  };

  /**
   * Saves the changes made to the time entry and closes the popover or dialog.
   */
  const acceptChange = async () => {

    if (!currentActivity) {
      return;
    }

    const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    await updateTimeEntry({
      activity: currentActivity,
      description: '',
      end: timeEntry.end == null ? null : endDateTime?.toDate(currentTimeZone) ?? null,
      id: timeEntry.id,
      start: startDateTime.toDate(currentTimeZone)
    });

    popoverClose();
  }

  /**
   * Asynchronously saves a new time entry with the provided activity details,
   * description, and timestamps, taking into account the user's current time zone.
   * After saving the entry, it closes the associated popover interface.
   *
   * This function retrieves the current system time zone, formats the start and end
   * timestamps based on the time zone, and invokes a function to add a new time entry
   * record. If an end time is not provided, it defaults to null.
   */
  const saveNewEntry = async () => {
    const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await addTimeEntry({
      activity: currentActivity,
      description: description,
      id: 0,
      start: startDateTime.toDate(currentTimeZone),
      end: endDateTime?.toDate(currentTimeZone) ?? null,
    })
    popoverClose();
  };

  /**
   * Deletes the currently selected time entry and closes the popover or dialog.
   */
  const deleteTimeEntry = async () => {
    await removeTimeEntry(timeEntry.id);
    popoverClose();
  }

  /**
   * Cancels the current operation by resetting the new time entry and closing the popover.
   *
   * This function performs two actions:
   * 1. Resets the state of the new time entry to null.
   * 2. Closes the currently open popover, ensuring no unintended actions are performed.
   *
   * Typically used to discard changes or exit a workflow that involves time entry or popover interactions.
   */
  const cancel = () => {
    setNewTimeEntry(null);
    popoverClose();
  };

  return <>
    <div className={[classes.timeTrackingEdit, 'flex', 'flex-col', 'gap-2'].join(' ')}
         ref={ref}>
      <div className={['flex', 'flex-row', 'items-center'].join(' ')}>

        <div className={'grow'}>
          <h1>
            {currentActivity?.name}
          </h1>
        </div>
        <div className={['flex', 'flex-row'].join(' ')}>
          {
            activeActivity?.id == timeEntry.activity?.id && !newEntry
              ? <>
                  <Button isIconOnly={true}
                          className={classes.stopButton}
                          style={{backgroundColor : '#ffffff00', color: '#ffffff'}}
                          variant={'light'}
                          onPress={stopTracking}>
                    <Svg className={classes.button}
                         viewBox={'0 -960 960 960'}
                         path={'M240-320v-320q0-33 23.5-56.5T320-720h320q33 0 56.5 23.5T720-640v320q0 33-23.5 56.5T640-240H320q-33 0-56.5-23.5T240-320Z'}/>
                  </Button>
                  <FractionSpinner/>
                </>
              : <>
                {
                  newEntry
                    ? <></>
                    : <Button isIconOnly={true}
                              className={classes.stopButton}
                              style={{backgroundColor : '#ffffff00', color: '#ffffff'}}
                              variant={'light'}
                              onPress={deleteTimeEntry}>
                        <Svg className={classes.button}
                             viewBox={'0 -960 960 960'}
                             path={'M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm148.5-171.5Q440-303 440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280q17 0 28.5-11.5Zm160 0Q600-303 600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280q17 0 28.5-11.5Z'}/>
                      </Button>
                }
                </>
          }
        </div>
      </div>

      <div className={['flex', 'flex-row','items-center','gap-2'].join(' ')}>
        <span className={classes.tofro}>From:</span>
        <DateInput granularity={'second'}
                   value={startDateTime}
                   onChange={value => value ? setStartDateTime(value) : () => {}}/>
      </div>
      {
        endDateTime
        ? <div className={['flex', 'flex-row','items-center','gap-2'].join(' ')}>
            <span className={classes.tofro}>To:</span>
            <DateInput granularity={'second'}
                       value={endDateTime}
                       onChange={value => value ? setEndDateTime(value) : () => {}}/>
          </div>
        : <></>
      }

      <div>
        <Select selectedKeys={[generateActivityKey(currentActivity?.id ?? timeEntry.activity?.id ?? 0)]}
                label={'Activity'}
                selectionMode={'single'}
                onSelectionChange={handleActivityChange}
                items={activities}>
          {
            item =>
              <SelectItem key={generateActivityKey(item.id)}
                          startContent={<span className={classes.activityBullet}
                                              style={{backgroundColor: IntToHex(item.activityColor)}}/>}>
                {item.name}
              </SelectItem>
          }
        </Select>
      </div>

      <div>
        <Textarea label={'Description'}
                  value={description}
                  maxLength={256}
                  onChange={e => setDescription(e.target.value)}/>
      </div>

      <div className={['flex', 'flex-row','items-center','justify-end','gap-2'].join(' ')}>
        {
          newEntry
            ? <Button color={'default'}
                      onPress={saveNewEntry}>
                <span>Save</span>
              </Button>
            : <Button color={'default'}
                      onPress={acceptChange}>
                <span>Update</span>
              </Button>
        }
        {/* TODO move this to i18next  */}
        <Button color={'warning'}
                onPress={cancel}>
          <span>Cancel</span>
        </Button>
      </div>

    </div>
  </>;
};

// endregion

// region Export

export default CellActivityEdit;

// endregion