import classes from './overview.module.scss';
import {Button, Flex, HStack, DatePicker, Portal, For} from '@chakra-ui/react';
import {TimeTable} from '../../components/timeTable/timeTable.tsx';
import {LuCalendar} from 'react-icons/lu';
import {getLocalTimeZone, today} from '@internationalized/date';
import {Activity} from '../../components/activity.tsx';
import {useWeek} from '../../providers/weekContext.ts';
import {useActivities} from '../../queries/activities.ts';
import {useTimeEntries} from '../../queries/timeEntries.ts';
import type {ITimeEntryDto} from '../../network/intents/timeEntry/timeEntryDto.ts';
import type {IActivityDto} from '../../network/intents/activities/activityDto.ts';

/**
 * Stable placeholders while loading, a new array on every render would retrigger the effects of the time table
 */
const NO_ACTIVITIES: IActivityDto[] = [];
const NO_TIME_ENTRIES: ITimeEntryDto[] = [];

/**
 * Page showing the time entries of the selected week within a time table.
 */
export const Overview = () => {

  const {
weekDays, date, setDate,
} = useWeek();
  const {data: activities = NO_ACTIVITIES} = useActivities(null);
  const {data: timeEntries = NO_TIME_ENTRIES} = useTimeEntries(weekDays);

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
          <Button onClick={() => setDate(today(getLocalTimeZone()))}>
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
                  <DatePicker.View view='day'>
                    <DatePicker.Header />
                    <DatePicker.DayTable />
                  </DatePicker.View>
                  <DatePicker.View view='month'>
                    <DatePicker.Header />
                    <DatePicker.MonthTable />
                  </DatePicker.View>
                  <DatePicker.View view='year'>
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
