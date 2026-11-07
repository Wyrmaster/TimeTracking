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
import {useApi} from '../../providers/apiContext.ts';
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
import {
  formatDuration,
  fromDateInput,
  ticksToMilliseconds,
  toDateInput,
} from '../../common/dateFormat.ts';
import {
  DATE_PRESETS,
  type DatePreset,
  getPresetRange,
  type IDateRange,
} from '../../common/datePresets.ts';
import {useWorkspaces} from '../../queries/workspaces.ts';
import {useActivities} from '../../queries/activities.ts';
import {useStatistics} from '../../queries/statistics.ts';

/**
 * Amount of time entries shown per page of the table
 */
const PAGE_SIZE: number = 25;

/**
 * Stable placeholders while loading, the workspace select resets itself whenever it receives a new array
 */
const NO_WORKSPACES: IWorkspaceDto[] = [];
const NO_ACTIVITIES: IActivityDto[] = [];
const NO_ENTRIES: ITimeEntryDto[] = [];

/**
 * Formats a duration reported by the api in ticks as `Hh MMm`.
 * @param ticks The duration in ticks.
 */
const formatTicks = (ticks: number): string => formatDuration(ticksToMilliseconds(ticks));

/**
 * Resolves a predefined date range relative to today.
 * @param preset The predefined date range.
 */
const getRange = (preset: DatePreset): IDateRange =>
  getPresetRange(preset, new Date(), settings.getFirstDayOfTheWeek());

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

  const {downloadAsync} = useApi();
  const {data: workspaces = NO_WORKSPACES} = useWorkspaces();

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number|null>(null);
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string>(() => toDateInput(getRange('This month').start));
  const [endDate, setEndDate] = useState<string>(() => toDateInput(new Date()));
  const [selectedActivityName, setSelectedActivityName] = useState<string|null>(null);
  const [page, setPage] = useState<number>(1);
  const [exporting, setExporting] = useState<StatisticsExportType|null>(null);

  // until a workspace is picked the active one is shown
  const selectedWorkspace: IWorkspaceDto|null =
    workspaces.find(workspace => workspace.id == selectedWorkspaceId)
    ?? workspaces.find(workspace => workspace.isActive)
    ?? null;

  const {
    data: workspaceActivities = NO_ACTIVITIES,
    isLoading: loadingActivities,
  } = useActivities(selectedWorkspace?.id ?? null);

  const {contains} = useFilter({sensitivity: 'base'});
  const {
collection, filter: filterActivities, set: setActivityItems,
} = useListCollection<IActivityDto>({
    initialItems: [],
    itemToString: activity => activity.name,
    itemToValue: activity => activity.id.toString(),
    filter: contains,
  });

  useEffect(() => setActivityItems(workspaceActivities), [workspaceActivities, setActivityItems]);

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
    [selectedWorkspace, startDate, endDate, selectedActivityIds, workspaceActivities],
  );

  const {data: statistics} = useStatistics(filter);
  const allTimeEntries: ITimeEntryDto[] = statistics?.timeEntries ?? NO_ENTRIES;
  const activities: ITimeEntryDto[] = statistics?.statistics ?? NO_ENTRIES;

  // a new filter clears the selected activity of the chart and the table
  const filterKey: string = JSON.stringify(filter);
  const [prevFilterKey, setPrevFilterKey] = useState<string>(filterKey);

  if (filterKey != prevFilterKey) {
    setPrevFilterKey(filterKey);
    setSelectedActivityName(null);
    setPage(1);
  }

  /**
   * Downloads the filtered statistics as tab separated values.
   * @param type The table of the statistics to export.
   */
  const exportStatistics = async (type: StatisticsExportType) => {
    setExporting(type);

    try {
      const file: Blob = await downloadAsync(new GetStatisticsExportIntent(filter, type));
      saveFile(file, `statistics-${type.toLowerCase()}-${startDate}-${endDate}.tsv`);
    }
    catch {
      toaster.create({description: 'Failed to export the statistics...', type: 'error'});
    }
    finally {
      setExporting(null);
    }
  };

  /**
   * Sets the date range of the filter to a predefined range.
   * @param preset The predefined date range.
   */
  const applyPreset = (preset: DatePreset) => {
    const range: IDateRange = getRange(preset);

    setStartDate(toDateInput(range.start));
    setEndDate(toDateInput(range.end));
  };

  /**
   * Whether the date range of the filter matches the given predefined range.
   * @param preset The predefined date range.
   */
  const isPresetActive = (preset: DatePreset): boolean => {
    const range: IDateRange = getRange(preset);

    return toDateInput(range.start) == startDate && toDateInput(range.end) == endDate;
  };

  const segments: IDonutSegment[] = useMemo(
    () => activities.map((activity: ITimeEntryDto) => ({
      label: activity.activityName,
      value: activity.duration,
      color: activity.color,
    })),
    [activities],
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
    [allTimeEntries],
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
                               setSelectedWorkspaceId(workspace.id);
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
        <DonutChart key={filterKey}
                    segments={segments}
                    formatValue={formatTicks}
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
                    <Table.Cell>{item.start?.toLocaleString() ?? ''}</Table.Cell>
                    <Table.Cell>{item.end?.toLocaleString() ?? ''}</Table.Cell>
                    <Table.Cell textAlign={'end'}>{formatTicks(item.duration)}</Table.Cell>
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
