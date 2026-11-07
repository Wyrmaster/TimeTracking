import classes from './overview.module.scss';
import {Button, Flex, HStack, DatePicker, Portal, For} from '@chakra-ui/react';
import {useActivity} from '../../providers/activityProvider.tsx';
import {TimeTable} from '../../components/timeTable/timeTable.tsx';
import {LuCalendar} from 'react-icons/lu';
import {type DateValue, parseDate} from '@internationalized/date';
import type {IActivityDto} from '../../network/intents/activities/activityDto.ts';
import {useEffect, useState} from 'react';
import {Activity} from '../../components/activity.tsx';

/**
 * Page showing the time entries of the selected week within a time table.
 * @constructor
 */
export const Overview = () => {

  const {
    timeEntries,
    weekDays,
    date,
    setDate,
    loadActivities,
    activitiesRevision,
    refreshTracking
  } = useActivity();

  const [activities, setActivities] = useState<IActivityDto[]>([]);

  useEffect(() => {
    refreshTracking().then();
  }, []);

  useEffect(() => {
    loadActivities(null).then(setActivities);
  }, [activitiesRevision]);

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

  return <>
    <Flex direction={'row'}
          flex={'1'}
          minHeight={'0'}>
      <Flex direction={'column'}
            flexShrink={'0'}
            width={'18rem'}
            minHeight={'0'}
            overflowY={'auto'}>
        <For each={activities}>
          {(activity) => <Activity key={activity.id}
                                   canTrack={true}
                                   grow={false}
                                   readonly={true}
                                   activity={activity}/>}
        </For>
      </Flex>
      <Flex direction={'column'}
            flex={'1'}
            minHeight={'0'}
            className={classes.overview}>
        <HStack padding={'0.5rem 0.5rem 0 0.5rem'}>
          <Button onClick={() => setDate(date.add({days: -7}))}>
            Previous Week
          </Button>
          <Button onClick={() => setDate(parseDate(getDateString(new Date())) as unknown as DateValue) }>
            Today
          </Button>
          <Button onClick={() => setDate(date.add({days: 7}))}>
            Next Week
          </Button>
          <DatePicker.Root size={'sm'}
                           marginTop={'-0.35rem'}
                           selectionMode={'single'}
                           onValueChange={(e) => setDate(e.value[0])}
                           value={[date]}>
            <DatePicker.Label />
            <DatePicker.Control>
              <DatePicker.Input/>
              <DatePicker.IndicatorGroup>
                <DatePicker.Trigger>
                  <LuCalendar />
                </DatePicker.Trigger>
              </DatePicker.IndicatorGroup>
            </DatePicker.Control>
            <Portal>
              <DatePicker.Positioner>
                <DatePicker.Content>
                  <DatePicker.View view="day">
                    <DatePicker.Header />
                    <DatePicker.DayTable />
                  </DatePicker.View>
                  <DatePicker.View view="month">
                    <DatePicker.Header />
                    <DatePicker.MonthTable />
                  </DatePicker.View>
                  <DatePicker.View view="year">
                    <DatePicker.Header />
                    <DatePicker.YearTable />
                  </DatePicker.View>
                </DatePicker.Content>
              </DatePicker.Positioner>
            </Portal>
          </DatePicker.Root>
        </HStack>

        <TimeTable timeEntries={timeEntries}
                   days={weekDays}/>
      </Flex>
    </Flex>
  </>;
};
