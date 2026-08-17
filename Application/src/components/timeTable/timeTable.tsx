import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import classes from './timeTable.module.scss';
import {Box, Flex, For, Table, Text} from '@chakra-ui/react';
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
 * Height of a single hour row at a zoom level of 1, in rem
 */
const HOUR_ROW_HEIGHT: number = 4;

/**
 * Smallest allowed zoom level
 */
const MIN_ZOOM: number = 0.25;

/**
 * Largest allowed zoom level
 */
const MAX_ZOOM: number = 8;

/**
 * Factor translating the scroll distance of a wheel event into a change of the zoom level
 */
const ZOOM_SENSITIVITY: number = 0.0015;

/**
 * Scroll distance of a single wheel notch, used to normalize wheel events reporting their
 * distance in lines or pages instead of pixels
 */
const WHEEL_LINE_HEIGHT: number = 16;
const WHEEL_PAGE_HEIGHT: number = 400;

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
 * Limits a value to the given range.
 * @param value The value to limit.
 * @param minimum The smallest allowed value.
 * @param maximum The largest allowed value.
 */
const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

/**
 * Converts the scroll distance of a wheel event into pixels, no matter which unit the browser
 * reported it in.
 * @param event The wheel event to normalize.
 */
const toPixels = (event: WheelEvent): number => {
  switch (event.deltaMode) {
    case WheelEvent.DOM_DELTA_LINE:
      return event.deltaY * WHEEL_LINE_HEIGHT;
    case WheelEvent.DOM_DELTA_PAGE:
      return event.deltaY * WHEEL_PAGE_HEIGHT;
    default:
      return event.deltaY;
  }
};

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
 * Holding control while scrolling zooms the table, which stretches the hour rows and therefore
 * all tiles, keeping the point of time below the mouse cursor in place.
 *
 * @param timeEntries The time entries to display.
 * @param days The days rendered as columns.
 */
export const TimeTable = ({timeEntries, days}: IProps) => {

  const hours: number[] = getHoursOfDay();

  const scrollRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  /**
   * The point of time the zoom is centered on, remembered while the zoom level is applied.
   */
  const zoomAnchor = useRef<{minute: number, pointerOffset: number}|null>(null);

  const [now, setNow] = useState<Date>(new Date());
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<ITimeEntryDto|null>(null);
  const [bodyOffset, setBodyOffset] = useState<{top: number, height: number}>({top: 0, height: 0});
  const [zoom, setZoom] = useState<number>(1);

  /**
   * Height of a single hour row at the current zoom level.
   */
  const hourRowHeight: string = `${HOUR_ROW_HEIGHT * zoom}rem`;

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
   * Zooms the table when the wheel is used while control is held down instead of scrolling it.
   *
   * The listener is registered manually because it has to be non passive to be able to suppress
   * the zoom of the browser itself.
   */
  useEffect(() => {
    const scrollArea: HTMLDivElement|null = scrollRef.current;

    if (scrollArea == null) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      event.preventDefault();

      const body: HTMLTableSectionElement|null = bodyRef.current;

      if (body != null && body.offsetHeight > 0) {
        const pointerOffset: number = event.clientY - scrollArea.getBoundingClientRect().top;
        const minute: number =
          ((scrollArea.scrollTop + pointerOffset - body.offsetTop) / body.offsetHeight) * MINUTES_PER_DAY;

        zoomAnchor.current = {minute: clamp(minute, 0, MINUTES_PER_DAY), pointerOffset};
      }

      setZoom((current: number) =>
        clamp(current * Math.exp(-toPixels(event) * ZOOM_SENSITIVITY), MIN_ZOOM, MAX_ZOOM));
    };

    scrollArea.addEventListener('wheel', handleWheel, {passive: false});

    return () => scrollArea.removeEventListener('wheel', handleWheel);
  }, []);

  /**
   * Applies the new zoom level to the tiles and keeps the point of time the zoom was centered on
   * below the mouse cursor.
   */
  useLayoutEffect(() => {
    const anchor: {minute: number, pointerOffset: number}|null = zoomAnchor.current;
    const scrollArea: HTMLDivElement|null = scrollRef.current;
    const body: HTMLTableSectionElement|null = bodyRef.current;

    zoomAnchor.current = null;

    if (scrollArea == null || body == null) {
      return;
    }

    // measured here as well, so the tiles are resized within the same frame as the hour rows
    setBodyOffset({top: body.offsetTop, height: body.offsetHeight});

    if (anchor == null) {
      return;
    }

    const anchorOffset: number = body.offsetTop + (anchor.minute / MINUTES_PER_DAY) * body.offsetHeight;

    scrollArea.scrollTop = Math.max(0, anchorOffset - anchor.pointerOffset);
  }, [zoom]);

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
                    stickyHeader>
          <Table.Header>
            <Table.Row bg={'bg.emphasized'}>
              <Table.ColumnHeader width={TIME_COLUMN_WIDTH}
                                  paddingY={'0'}
                                  textAlign={'center'}>
                Time
              </Table.ColumnHeader>
              <For each={days}>
                {(day: DateValue, dayIndex: number) => {
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
                }}
              </For>
            </Table.Row>
          </Table.Header>

          <Table.Body ref={bodyRef}>
            <For each={hours}>
              {(hour: number) => (
                <Table.Row key={hour}
                           height={hourRowHeight}>
                  <Table.Cell height={hourRowHeight}
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
                  <For each={days}>
                    {(_: DateValue, dayIndex: number) => (
                      <Table.Cell key={dayIndex}
                                  height={hourRowHeight}
                                  padding={'0'}
                                  borderBottomWidth={'0'}
                                  borderInlineEndWidth={'1px'}
                                  className={classes.dayCell}/>
                    )}
                  </For>
                </Table.Row>
              )}
            </For>
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
