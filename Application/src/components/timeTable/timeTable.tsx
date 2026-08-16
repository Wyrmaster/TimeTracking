import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import classes from './timeTable.module.scss';
import {Box, Flex, Table, Text} from '@chakra-ui/react';
import type {DateValue} from '@internationalized/date';
import type {ITimeEntryDto} from '../../network/intents/timeEntry/timeEntryDto.ts';
import {
  formatMinutes,
  getHoursOfDay,
  getMinutesOfDay,
  isSameDay,
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
  splitTimeEntries,
  type ITimeEntrySegment
} from '../../common/timeGrid.ts';
import {IntToHex, IntToTextColor} from '../../common/transformer.ts';
import {TimeEntryDialog} from '../timeEntryDialog/timeEntryDialog.tsx';

// region Constants

/**
 * Height of a single hour row
 */
const HOUR_ROW_HEIGHT: string = '4rem';

/**
 * Width of the column containing the hours of the day
 */
const TIME_COLUMN_WIDTH: string = '5rem';

/**
 * Height of the sticky header
 */
const HEADER_HEIGHT: string = '3.25rem';

/**
 * Interval in which running time entries are updated
 */
const TICK_INTERVAL: number = 30_000;

/**
 * Color used for time entries without an activity
 */
const FALLBACK_COLOR: number = 0x6B7280;

// endregion

interface IProps {
  timeEntries: ITimeEntryDto[];
  days: DateValue[];
}

/**
 * Converts minutes since midnight into the vertical position within a day column.
 * @param minutes The minutes since midnight.
 */
const toOffset = (minutes: number): string => `${(minutes / MINUTES_PER_DAY) * 100}%`;

/**
 * Renders a week as a table, one row per hour split into quarter hour intervals and one
 * column per day.
 *
 * The time entries are rendered as tiles overlaying the day columns, colored with the color of
 * their activity and stretched to match their duration. Time entries spanning multiple days are
 * split up, so every day shows the part of the entry that belongs to it, and time entries without
 * an end are still running and therefore grow as time progresses.
 *
 * Clicking a tile opens a dialog to edit the time entry.
 *
 * @param timeEntries The time entries to display.
 * @param days The days rendered as columns.
 */
export const TimeTable = ({timeEntries, days}: IProps) => {

  const hours: number[] = getHoursOfDay();

  const scrollRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  const [now, setNow] = useState<Date>(new Date());
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<ITimeEntryDto|null>(null);
  const [bodyOffset, setBodyOffset] = useState<{top: number, height: number}>({top: 0, height: 0});

  /**
   * The segments of all time entries, grouped by the day column they belong to.
   */
  const segmentsByDay: ITimeEntrySegment[][] = useMemo(() => {
    const grouped: ITimeEntrySegment[][] = days.map(() => []);

    splitTimeEntries(timeEntries, days, now)
      .forEach((segment: ITimeEntrySegment) => grouped[segment.dayIndex].push(segment));

    return grouped;
  }, [timeEntries, days, now]);

  /**
   * Keeps running time entries growing.
   */
  useEffect(() => {
    const handle = setInterval(() => setNow(new Date()), TICK_INTERVAL);

    return () => clearInterval(handle);
  }, []);

  /**
   * Measures the area covered by the hour rows, which is the area the tiles are placed in.
   */
  useLayoutEffect(() => {
    const body: HTMLTableSectionElement|null = bodyRef.current;

    if (body == null) {
      return;
    }

    const measure = () => setBodyOffset({top: body.offsetTop, height: body.offsetHeight});
    measure();

    const observer: ResizeObserver = new ResizeObserver(measure);
    observer.observe(body);

    return () => observer.disconnect();
  }, [days.length]);

  /**
   * Scrolls to the current time once, so the relevant part of the day is visible.
   */
  useEffect(() => {
    const scrollArea: HTMLDivElement|null = scrollRef.current;

    if (scrollArea == null) {
      return;
    }

    scrollArea.scrollTop = Math.max(
      0,
      ((getMinutesOfDay(new Date()) - MINUTES_PER_HOUR) / MINUTES_PER_DAY) * scrollArea.scrollHeight
    );
  }, []);

  return <>
    <Table.ScrollArea ref={scrollRef}
                      flex={'1'}
                      minHeight={'0'}
                      margin={'1.5em'}
                      rounded={'md'}
                      borderWidth={'1px'}>
      <Box position={'relative'}>
        <Table.Root variant={'outline'}
                    size={'sm'}
                    tableLayout={'fixed'}
                    width={'100%'}
                    stickyHeader>
          <Table.Header bg={'bg.emphasized'}>
            <Table.Row height={HEADER_HEIGHT}>
              <Table.ColumnHeader width={TIME_COLUMN_WIDTH}
                                  height={HEADER_HEIGHT}
                                  paddingY={'0'}
                                  textAlign={'center'}>
                Time
              </Table.ColumnHeader>
              {days.map((day: DateValue, dayIndex: number) => {
                const isToday: boolean = isSameDay(day, now);

                return <Table.ColumnHeader key={dayIndex}
                                           height={HEADER_HEIGHT}
                                           paddingY={'0'}
                                           textAlign={'center'}
                                           color={isToday ? 'fg' : 'fg.muted'}>
                  <Text fontWeight={isToday ? 'bold' : 'semibold'}
                        lineHeight={'short'}>
                    {new Date(day.year, day.month - 1, day.day).toLocaleDateString(undefined, {weekday: 'short'})}
                  </Text>
                  <Text textStyle={'xs'}
                        color={'fg.muted'}
                        lineHeight={'short'}>
                    {`${day.day.toString().padStart(2, '0')}.${day.month.toString().padStart(2, '0')}.`}
                  </Text>
                </Table.ColumnHeader>;
              })}
            </Table.Row>
          </Table.Header>

          <Table.Body ref={bodyRef}>
            {hours.map((hour: number) => (
              <Table.Row key={hour}
                         height={HOUR_ROW_HEIGHT}>
                <Table.Cell height={HOUR_ROW_HEIGHT}
                            paddingY={'0'}
                            borderBottomWidth={'0'}
                            borderInlineEndWidth={'1px'}
                            verticalAlign={'top'}
                            textAlign={'center'}
                            color={'fg.muted'}
                            textStyle={'xs'}
                            className={classes.timeCell}>
                  {formatMinutes(hour * MINUTES_PER_HOUR)}
                </Table.Cell>
                {days.map((_: DateValue, dayIndex: number) => (
                  <Table.Cell key={dayIndex}
                              height={HOUR_ROW_HEIGHT}
                              padding={'0'}
                              borderBottomWidth={'0'}
                              borderInlineEndWidth={'1px'}
                              className={classes.dayCell}/>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {/* tiles of the time entries, aligned with the hour rows of the table */}
        <Flex position={'absolute'}
              top={`${bodyOffset.top}px`}
              height={`${bodyOffset.height}px`}
              left={TIME_COLUMN_WIDTH}
              right={'0'}
              zIndex={'0'}
              pointerEvents={'none'}>
          {days.map((day: DateValue, dayIndex: number) => (
            <Box key={dayIndex}
                 flex={'1'}
                 position={'relative'}>
              {segmentsByDay[dayIndex]?.map((segment: ITimeEntrySegment) => {
                const color: string = IntToHex(segment.timeEntry.activity?.activityColor ?? FALLBACK_COLOR);

                return <Box key={segment.key}
                            position={'absolute'}
                            top={toOffset(segment.startMinute)}
                            height={toOffset(segment.endMinute - segment.startMinute)}
                            minHeight={'1.05rem'}
                            insetInline={'2px'}
                            paddingX={'1.5'}
                            overflow={'hidden'}
                            cursor={'pointer'}
                            pointerEvents={'auto'}
                            background={`${color}D9`}
                            color={IntToTextColor(segment.timeEntry.activity?.activityColor ?? FALLBACK_COLOR)}
                            borderWidth={'1px'}
                            borderInlineStartWidth={'3px'}
                            borderColor={color}
                            borderTopRadius={segment.continuesFromPreviousDay ? '0' : 'sm'}
                            borderBottomRadius={segment.continuesOnNextDay ? '0' : 'sm'}
                            className={`${classes.tile} ${segment.isActive ? classes.activeTile : ''}`}
                            _hover={{filter: 'brightness(1.1)', boxShadow: 'sm'}}
                            title={`${segment.timeEntry.activity?.name ?? 'No activity'} - ${segment.timeEntry.description}`}
                            onClick={() => setSelectedTimeEntry(segment.timeEntry)}>
                  <Text textStyle={'xs'}
                        fontWeight={'semibold'}
                        lineHeight={'short'}
                        truncate>
                    {segment.timeEntry.activity?.name ?? 'No activity'}
                  </Text>
                  <Text textStyle={'2xs'}
                        lineHeight={'short'}
                        opacity={0.9}
                        truncate>
                    {segment.continuesFromPreviousDay ? '...' : formatMinutes(segment.startMinute)}
                    {' - '}
                    {
                      segment.isActive
                        ? 'running'
                        : segment.continuesOnNextDay ? '...' : formatMinutes(segment.endMinute)
                    }
                  </Text>
                </Box>;
              })}

              {/* indicator marking the current time */}
              {
                isSameDay(day, now)
                  ? <Box position={'absolute'}
                         top={toOffset(getMinutesOfDay(now))}
                         insetInline={'0'}
                         height={'2px'}
                         background={'red.500'}>
                    <Box position={'absolute'}
                         top={'-3px'}
                         insetStart={'-4px'}
                         boxSize={'8px'}
                         rounded={'full'}
                         background={'red.500'}/>
                  </Box>
                  : <></>
              }
            </Box>
          ))}
        </Flex>
      </Box>
    </Table.ScrollArea>

    {
      selectedTimeEntry != null
        ? <TimeEntryDialog key={selectedTimeEntry.id}
                           timeEntry={selectedTimeEntry}
                           open={true}
                           setOpen={open => {
                             if (!open) {
                               setSelectedTimeEntry(null);
                             }
                           }}/>
        : <></>
    }
  </>;
};
