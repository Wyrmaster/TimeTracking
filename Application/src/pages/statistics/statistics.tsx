import {useEffect, useMemo, useRef, useState} from 'react';
import classes from './statistics.module.scss';
import {
  Box,
  Button,
  Checkbox,
  Field,
  Flex,
  For,
  HStack,
  Input,
  Table,
  TableCaption,
  Text,
  Wrap,
} from '@chakra-ui/react';
import {LuDownload} from 'react-icons/lu';
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

/**
 * Ticks of a single hour, the unit the durations of the statistics are reported in
 */
const TICKS_PER_HOUR: number = 36_000_000_000;

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

  const statisticEntryMap = useRef<{[key:string]: ITimeEntryDto[]}>({});
  const [timeEntries, setTimeEntries] = useState<ITimeEntryDto[]>([]);

  const [prevWorkspaces, setPrevWorkspaces] = useState<IWorkspaceDto[]>(workspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState<IWorkspaceDto|null>(findActive(workspaces));
  const [workspaceActivities, setWorkspaceActivities] = useState<IActivityDto[]>([]);
  const [excludedActivityIds, setExcludedActivityIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string>(() => {
    const today: Date = new Date();
    return toDateInput(new Date(today.getFullYear(), today.getMonth(), 1));
  });
  const [endDate, setEndDate] = useState<string>(toDateInput(new Date()));
  const [exporting, setExporting] = useState<StatisticsExportType|null>(null);

  if (workspaces !== prevWorkspaces) {
    setPrevWorkspaces(workspaces);
    setSelectedWorkspace(findActive(workspaces));
  }

  const filter: IStatisticsFilter = useMemo(
    () => ({
      workspaceId: selectedWorkspace?.id ?? null,
      startDate: fromDateInput(startDate),
      endDate: fromDateInput(endDate, true),
      activityIdsToExclude: excludedActivityIds,
    }),
    [selectedWorkspace, startDate, endDate, excludedActivityIds]
  );

  useEffect(() => {
    loadActivities(selectedWorkspace?.id ?? null).then(setWorkspaceActivities);
  }, [selectedWorkspace]);

  useEffect(() => {
    sendRequestAsync(new GetStatisticsIntent(filter))
      .then(res => {
        if (res.code != 200 || res.response == null) {
          toaster.create({description: 'Failed to load the statistics...', type: 'error'});
          return;
        }

        const statistics: IStatisticsDto = res.response;

        statisticEntryMap.current = statistics.timeEntries.reduce((acc: {[key:string]: ITimeEntryDto[]}, curr) => {
          acc[curr.activityName] = [...(acc[curr.activityName] ? acc[curr.activityName] : []), curr];
          return acc;
        }, {});

        setActivities(statistics.statistics);
        setTimeEntries([]);
      });
  }, [filter]);

  /**
   * Includes or excludes an activity from the statistics.
   * @param activityId The id of the activity.
   * @param included Whether the activity should be part of the statistics.
   */
  const setActivityIncluded = (activityId: number, included: boolean) =>
    setExcludedActivityIds(current => included
      ? current.filter(id => id != activityId)
      : [...current, activityId]);

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

  const segments: IDonutSegment[] = useMemo(
    () => activities.map((activity: ITimeEntryDto) => ({
      label: activity.activityName,
      value: activity.duration,
      color: activity.color,
    })),
    [activities]
  );

  const segmentSelected = (segment?: IDonutSegment|null) =>
    setTimeEntries(segment == null ? [] : statisticEntryMap.current[segment.label] ?? []);

  return <>
    <Flex direction={'column'}
          align={'stretch'}
          gap={'6'}
          flexGrow={'1'}
          padding={'6'}
          overflowY={'hidden'}
          className={classes.statistics}>

      <Flex direction={'column'}
            gap={'3'}
            flexShrink={'0'}>
        <Wrap gap={'4'}
              align={'end'}>
          <WorkspaceSelect workspaces={workspaces}
                           onChange={workspace => {
                             setSelectedWorkspace(workspace);
                             setExcludedActivityIds([]);
                           }}/>
          <Field.Root width={'auto'}
                      padding={'1.25em 0'}>
            <Field.Label>From</Field.Label>
            <Input type={'date'}
                   value={startDate}
                   max={endDate}
                   onChange={event => setStartDate(event.target.value)}/>
          </Field.Root>
          <Field.Root width={'auto'}
                      padding={'1.25em 0'}>
            <Field.Label>To</Field.Label>
            <Input type={'date'}
                   value={endDate}
                   min={startDate}
                   onChange={event => setEndDate(event.target.value)}/>
          </Field.Root>
          <HStack padding={'1.25em 0'}>
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
          </HStack>
        </Wrap>
        <Wrap gap={'4'}>
          <For each={workspaceActivities}>
            {(activity) => (
              <Checkbox.Root key={activity.id}
                             checked={!excludedActivityIds.includes(activity.id)}
                             onCheckedChange={details => setActivityIncluded(activity.id, details.checked === true)}>
                <Checkbox.HiddenInput/>
                <Checkbox.Control/>
                <Checkbox.Label>
                  <HStack gap={'1.5'}>
                    <Box boxSize={'0.75em'}
                         rounded={'full'}
                         bg={IntToHex(activity.activityColor)}/>
                    {activity.name}
                  </HStack>
                </Checkbox.Label>
              </Checkbox.Root>
            )}
          </For>
        </Wrap>
      </Flex>

      <DonutChart segments={segments}
                  formatValue={formatDuration}
                  onSegmentClick={segmentSelected}/>

      {segments.length === 0 &&
        <Text textStyle={'sm'}
              color={'fg.muted'}>
          No tracked time yet
        </Text>
      }
      <Table.ScrollArea borderWidth={'0.125rem'}
                        display={'flex'}
                        flex={'1'}
                        rounded={'md'}>
        <Table.Root stickyHeader>
          <TableCaption defaultValue={'Entries'}/>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader />
              <Table.ColumnHeader>Start</Table.ColumnHeader>
              <Table.ColumnHeader>End</Table.ColumnHeader>
              <Table.ColumnHeader>Duration</Table.ColumnHeader>
              <Table.ColumnHeader>Activity</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body overflowY={'scroll'}>
            {
              <For each={timeEntries}>
                {
                  (item, index) => <Table.Row key={index}>
                    <Table.Cell>{item.color}</Table.Cell>
                    <Table.Cell>{item.start?.toString()}</Table.Cell>
                    <Table.Cell>{item.end?.toString()}</Table.Cell>
                    <Table.Cell>{formatDuration(item.duration)}</Table.Cell>
                    <Table.Cell>{item.activityName}</Table.Cell>
                  </Table.Row>
                }
              </For>
            }
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Flex>
  </>;
};
