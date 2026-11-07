import {useEffect, useMemo, useState} from 'react';
import classes from './statistics.module.scss';
import {
  Box,
  Button,
  ButtonGroup,
  Combobox,
  Field,
  Flex,
  For,
  HStack,
  IconButton,
  Input,
  Pagination,
  Portal,
  Spinner,
  Table,
  Text,
  useFilter,
  useListCollection,
  Wrap,
} from '@chakra-ui/react';
import {
  LuChevronLeft,
  LuChevronRight,
  LuDownload,
} from 'react-icons/lu';
import type {IStatisticsDto} from '../../network/intents/statistics/statisticsDto.ts';
import {useApi} from '../../providers/apiProvider.tsx';
import {useActivity} from '../../providers/activityProvider.tsx';
import {useWorkspace} from '../../providers/workspaceProvider.tsx';
import {GetStatisticsIntent} from '../../network/intents/statistics/getStatisticsIntent.ts';
import {
  GetStatisticsExportIntent,
  type StatisticsExportType,
} from '../../network/intents/statistics/getStatisticsExportIntent.ts';
import type {IStatisticsFilter} from '../../network/intents/statistics/statisticsFilter.ts';
import type {ITimeEntryDto} from '../../network/intents/statistics/timeEntryDto.ts';
import type {IActivityDto} from '../../network/intents/activities/activityDto.ts';
import type {IWorkspaceDto} from '../../network/intents/workspace/workspaceDto.ts';
import {DonutChart, type IDonutSegment} from '../../components/donutChart.tsx';
import {WorkspaceSelect} from '../../components/workspaceSelect.tsx';
import {IntToHex} from '../../common/transformer.ts';
import {toaster} from '../../components/ui/toaster.tsx';
import {settings} from '../../common/settings.ts';

/**
 * Ticks of a single hour, the unit the durations of the statistics are reported in
 */
const TICKS_PER_HOUR: number = 36_000_000_000;

/**
 * Amount of time entries shown per page of the table
 */
const PAGE_SIZE: number = 25;

/**
 * Converts a duration in ticks into a formatted string in the format "HHh MMm".
 * @param ticks The duration in ticks.
 */
const formatDuration = (ticks: number): string => {
  const totalMinutes: number = Math.round(ticks / (TICKS_PER_HOUR / 60));

  const hours: number = Math.floor(totalMinutes / 60);
  const minutes: number = totalMinutes % 60;

  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

/**
 * Formats a date as the value of a `date` input (`YYYY-MM-DD`).
 * @param date The date to format.
 */
const toDateInput = (date: Date): string =>
  `${date.getFullYear()}`
  + `-${(date.getMonth() + 1).toString().padStart(2, '0')}`
  + `-${date.getDate().toString().padStart(2, '0')}`;

/**
 * Parses the value of a `date` input as a local date.
 * @param value The value of the input (`YYYY-MM-DD`).
 * @param endOfDay Whether the last moment of the day should be returned instead of midnight.
 */
const fromDateInput = (value: string, endOfDay: boolean = false): Date|null => {
  if (value.length == 0) {
    return null;
  }

  const [year, month, day] = value
    .split('-')
    .map(part => parseInt(part));
  const date: Date = endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day);

  return isNaN(date.getTime()) ? null : date;
};

/**
 * Predefined date ranges the statistics can be filtered by
 */
type DatePreset = 'This week' | 'Last week' | 'This month' | 'Last month' | 'This year';

const DATE_PRESETS: DatePreset[] = [
  'This week',
  'Last week',
  'This month',
  'Last month',
  'This year',
];

/**
 * Resolves the first and the last day of a predefined date range, relative to today.
 *
 * Weeks start at the first day of the week configured in the settings.
 *
 * @param preset The predefined date range.
 */
const getPresetRange = (preset: DatePreset): {start: Date, end: Date} => {
  const today: Date = new Date();
  const year: number = today.getFullYear();
  const month: number = today.getMonth();

  const daysSinceWeekStart: number = (today.getDay() - settings.GetFirstDayOfTheWeek() + 7) % 7;
  const weekStart: Date = new Date(year, month, today.getDate() - daysSinceWeekStart);

  switch (preset) {
    case 'This week':
      return {
        start: weekStart,
        end: new Date(year, month, weekStart.getDate() + 6),
      };
    case 'Last week':
      return {
        start: new Date(year, month, weekStart.getDate() - 7),
        end: new Date(year, month, weekStart.getDate() - 1),
      };
    case 'This month':
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0),
      };
    case 'Last month':
      return {
        start: new Date(year, month - 1, 1),
        end: new Date(year, month, 0),
      };
    case 'This year':
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31),
      };
  }
};

/**
 * Hands the given file to the browser to be saved.
 * @param file The file to save.
 * @param fileName The name the file is saved with.
 */
const saveFile = (file: Blob, fileName: string) => {
  const url: string = URL.createObjectURL(file);
  const anchor: HTMLAnchorElement = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
};

/**
 * Shows how the tracked time is distributed over the activities of a workspace.
 *
 * The statistics can be filtered by workspace, date range and activities, the filtered
 * statistics can be exported as tab separated values.
 */
export const Statistics = () => {

  const { sendRequestAsync, downloadAsync } = useApi();
  const { workspaces } = useWorkspace();
  const { loadActivities } = useActivity();

  const findActive = (workspaces: IWorkspaceDto[]) =>
    workspaces.find(entry => entry.isActive) ?? null;

  const [activities, setActivities] = useState<ITimeEntryDto[]>([]);

  const [allTimeEntries, setAllTimeEntries] = useState<ITimeEntryDto[]>([]);
  const [selectedActivityName, setSelectedActivityName] = useState<string|null>(null);
  const [loadCount, setLoadCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  const [prevWorkspaces, setPrevWorkspaces] = useState<IWorkspaceDto[]>(workspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState<IWorkspaceDto|null>(findActive(workspaces));
  const [workspaceActivities, setWorkspaceActivities] = useState<IActivityDto[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string>(() => toDateInput(getPresetRange('This month').start));
  const [endDate, setEndDate] = useState<string>(toDateInput(new Date()));
  const [exporting, setExporting] = useState<StatisticsExportType|null>(null);

  const {contains} = useFilter({sensitivity: 'base'});
  const {collection, filter: filterActivities, set: setActivityItems} = useListCollection<IActivityDto>({
    initialItems: [],
    itemToString: activity => activity.name,
    itemToValue: activity => activity.id.toString(),
    filter: contains,
  });

  if (workspaces !== prevWorkspaces) {
    setPrevWorkspaces(workspaces);
    setSelectedWorkspace(findActive(workspaces));
  }

  const filter: IStatisticsFilter = useMemo(
    () => ({
      workspaceId: selectedWorkspace?.id ?? null,
      startDate: fromDateInput(startDate),
      endDate: fromDateInput(endDate, true),
      // no selection shows all activities, otherwise everything that is not selected is excluded
      activityIdsToExclude: selectedActivityIds.length == 0
        ? []
        : workspaceActivities
          .map(activity => activity.id)
          .filter(id => !selectedActivityIds.includes(id)),
    }),
    [selectedWorkspace, startDate, endDate, selectedActivityIds, workspaceActivities]
  );

  useEffect(() => {
    loadActivities(selectedWorkspace?.id ?? null, setLoadingActivities)
      .then(loadedActivities => {
        setWorkspaceActivities(loadedActivities);
        setActivityItems(loadedActivities);
      });
  }, [selectedWorkspace]);

  useEffect(() => {
    sendRequestAsync(new GetStatisticsIntent(filter))
      .then(res => {
        if (res.code != 200 || res.response == null) {
          toaster.create({description: 'Failed to load the statistics...', type: 'error'});
          return;
        }

        const statistics: IStatisticsDto = res.response;

        setActivities(statistics.statistics);
        setAllTimeEntries(statistics.timeEntries);
        setSelectedActivityName(null);
        setPage(1);
        // remounts the chart, so its selection is cleared together with the table
        setLoadCount(count => count + 1);
      });
  }, [filter]);

  /**
   * Downloads the filtered statistics as tab separated values.
   * @param type The table of the statistics to export.
   */
  const exportStatistics = async (type: StatisticsExportType) => {
    setExporting(type);

    const file: Blob|null = await downloadAsync(new GetStatisticsExportIntent(filter, type));

    setExporting(null);

    if (file == null) {
      toaster.create({description: 'Failed to export the statistics...', type: 'error'});
      return;
    }

    saveFile(file, `statistics-${type.toLowerCase()}-${startDate}-${endDate}.tsv`);
  };

  /**
   * Sets the date range of the filter to a predefined range.
   * @param preset The predefined date range.
   */
  const applyPreset = (preset: DatePreset) => {
    const range = getPresetRange(preset);

    setStartDate(toDateInput(range.start));
    setEndDate(toDateInput(range.end));
  };

  /**
   * Whether the date range of the filter matches the given predefined range.
   * @param preset The predefined date range.
   */
  const isPresetActive = (preset: DatePreset): boolean => {
    const range = getPresetRange(preset);

    return toDateInput(range.start) == startDate && toDateInput(range.end) == endDate;
  };

  const segments: IDonutSegment[] = useMemo(
    () => activities.map((activity: ITimeEntryDto) => ({
      label: activity.activityName,
      value: activity.duration,
      color: activity.color,
    })),
    [activities]
  );

  const segmentSelected = (segment?: IDonutSegment|null) => {
    setSelectedActivityName(segment?.label ?? null);
    setPage(1);
  };

  /**
   * The time entries grouped by the name of their activity.
   */
  const timeEntriesByActivity: {[key: string]: ITimeEntryDto[]} = useMemo(
    () => allTimeEntries.reduce((acc: {[key: string]: ITimeEntryDto[]}, curr) => {
      acc[curr.activityName] = [...(acc[curr.activityName] ?? []), curr];
      return acc;
    }, {}),
    [allTimeEntries]
  );

  const shownTimeEntries: ITimeEntryDto[] = selectedActivityName == null
    ? allTimeEntries
    : timeEntriesByActivity[selectedActivityName] ?? [];

  const pagedTimeEntries: ITimeEntryDto[] = shownTimeEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return <>
    <Flex direction={'column'}
          align={'stretch'}
          gap={'6'}
          flexGrow={'1'}
          minHeight={'0'}
          padding={'6'}
          overflowY={'auto'}
          className={classes.statistics}>

      <Flex direction={'column'}
            gap={'3'}
            flexShrink={'0'}>
        <Wrap gap={'4'}
              align={'end'}>
          <Box width={'14rem'}>
            <WorkspaceSelect workspaces={workspaces}
                             padding={'0'}
                             onChange={workspace => {
                               setSelectedWorkspace(workspace);
                               setSelectedActivityIds([]);
                             }}/>
          </Box>
          <Field.Root width={'auto'}>
            <Field.Label>From</Field.Label>
            <Input type={'date'}
                   value={startDate}
                   max={endDate}
                   onChange={event => setStartDate(event.target.value)}/>
          </Field.Root>
          <Field.Root width={'auto'}>
            <Field.Label>To</Field.Label>
            <Input type={'date'}
                   value={endDate}
                   min={startDate}
                   onChange={event => setEndDate(event.target.value)}/>
          </Field.Root>
          <Combobox.Root collection={collection}
                         width={'16rem'}
                         multiple
                         closeOnSelect={false}
                         openOnClick
                         value={selectedActivityIds.map(id => id.toString())}
                         onValueChange={details => setSelectedActivityIds(details.value.map(id => parseInt(id)))}
                         onInputValueChange={details => filterActivities(details.inputValue)}>
            <Combobox.Label>Activities</Combobox.Label>
            <Combobox.Control>
              <Combobox.Input placeholder={
                selectedActivityIds.length == 0
                  ? 'All activities'
                  : `${selectedActivityIds.length} selected`
              }/>
              <Combobox.IndicatorGroup>
                {loadingActivities ? <Spinner size={'xs'} borderWidth={'1.5px'}/> : <Combobox.ClearTrigger/>}
                <Combobox.Trigger/>
              </Combobox.IndicatorGroup>
            </Combobox.Control>
            <Portal>
              <Combobox.Positioner>
                <Combobox.Content>
                  <Combobox.Empty>No activities found</Combobox.Empty>
                  {collection.items.map(activity => (
                    <Combobox.Item item={activity}
                                   key={activity.id}>
                      <HStack gap={'0.5em'}>
                        <Box boxSize={'0.75em'}
                             rounded={'full'}
                             bg={IntToHex(activity.activityColor)}/>
                        <Combobox.ItemText>{activity.name}</Combobox.ItemText>
                      </HStack>
                      <Combobox.ItemIndicator/>
                    </Combobox.Item>
                  ))}
                </Combobox.Content>
              </Combobox.Positioner>
            </Portal>
          </Combobox.Root>
          <Button variant={'outline'}
                  loading={exporting == 'Entries'}
                  onClick={() => exportStatistics('Entries')}>
            <LuDownload/>
            Export entries
          </Button>
          <Button variant={'outline'}
                  loading={exporting == 'Summary'}
                  onClick={() => exportStatistics('Summary')}>
            <LuDownload/>
            Export summary
          </Button>
        </Wrap>
        <Wrap gap={'2'}>
          <For each={DATE_PRESETS}>
            {(preset: DatePreset) => (
              <Button key={preset}
                      size={'xs'}
                      variant={isPresetActive(preset) ? 'solid' : 'outline'}
                      onClick={() => applyPreset(preset)}>
                {preset}
              </Button>
            )}
          </For>
        </Wrap>
      </Flex>

      <Flex justify={'center'}
            flexShrink={'0'}>
        <DonutChart key={loadCount}
                    segments={segments}
                    formatValue={formatDuration}
                    onSegmentClick={segmentSelected}/>
      </Flex>

      {segments.length === 0 &&
        <Text textStyle={'sm'}
              textAlign={'center'}
              color={'fg.muted'}>
          No tracked time in this range
        </Text>
      }

      <Flex direction={'column'}
            gap={'2'}
            flexShrink={'0'}>
        <Text fontWeight={'semibold'}>
          {selectedActivityName == null ? 'All entries' : `Entries of ${selectedActivityName}`}
          <Text as={'span'}
                color={'fg.muted'}
                fontWeight={'normal'}>
            {` (${shownTimeEntries.length})`}
          </Text>
        </Text>
        <Table.ScrollArea borderWidth={'1px'}
                          minHeight={'20rem'}
                          maxHeight={'60vh'}
                          rounded={'md'}>
          <Table.Root size={'sm'}
                      stickyHeader>
            <Table.Header>
              <Table.Row bg={'bg.subtle'}>
                <Table.ColumnHeader width={'2rem'}/>
                <Table.ColumnHeader>Activity</Table.ColumnHeader>
                <Table.ColumnHeader>Start</Table.ColumnHeader>
                <Table.ColumnHeader>End</Table.ColumnHeader>
                <Table.ColumnHeader textAlign={'end'}>Duration</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <For each={pagedTimeEntries}>
                {
                  (item, index) => <Table.Row key={index}>
                    <Table.Cell>
                      <Box boxSize={'0.75em'}
                           rounded={'full'}
                           bg={IntToHex(item.color)}/>
                    </Table.Cell>
                    <Table.Cell>{item.activityName}</Table.Cell>
                    <Table.Cell>{item.start == null ? '' : new Date(item.start).toLocaleString()}</Table.Cell>
                    <Table.Cell>{item.end == null ? '' : new Date(item.end).toLocaleString()}</Table.Cell>
                    <Table.Cell textAlign={'end'}>{formatDuration(item.duration)}</Table.Cell>
                  </Table.Row>
                }
              </For>
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
        {
          shownTimeEntries.length > PAGE_SIZE
            ? <Pagination.Root count={shownTimeEntries.length}
                               pageSize={PAGE_SIZE}
                               page={page}
                               onPageChange={details => setPage(details.page)}
                               alignSelf={'center'}>
                <ButtonGroup variant={'ghost'}
                             size={'sm'}>
                  <Pagination.PrevTrigger asChild>
                    <IconButton aria-label={'Previous page'}>
                      <LuChevronLeft/>
                    </IconButton>
                  </Pagination.PrevTrigger>
                  <Pagination.Items render={item => (
                    <IconButton variant={{base: 'ghost', _selected: 'outline'}}>
                      {item.value}
                    </IconButton>
                  )}/>
                  <Pagination.NextTrigger asChild>
                    <IconButton aria-label={'Next page'}>
                      <LuChevronRight/>
                    </IconButton>
                  </Pagination.NextTrigger>
                </ButtonGroup>
              </Pagination.Root>
            : <></>
        }
      </Flex>
    </Flex>
  </>;
};
