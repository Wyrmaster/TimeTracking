import {useEffect, useMemo, useRef, useState} from 'react';
import classes from './statistics.module.scss';
import {Flex, For, Table, TableCaption, Text} from '@chakra-ui/react';
import type {IStatisticsDto} from '../../network/intents/statistics/statisticsDto.ts';
import {useApi} from '../../providers/apiProvider.tsx';
import {GetStatisticsIntent} from '../../network/intents/statistics/getStatisticsIntent.ts';
import type {ITimeEntryDto} from '../../network/intents/statistics/timeEntryDto.ts';
import {DonutChart, type IDonutSegment} from '../../components/donutChart.tsx';

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
 * Shows how the tracked time is distributed over the activities of the active workspace.
 */
export const Statistics = () => {

  const { sendRequestAsync } = useApi();

  const [activities, setActivities] = useState<ITimeEntryDto[]>([]);

  const statisticEntryMap = useRef<{[key:string]: ITimeEntryDto[]}>({});
  const [timeEntries, setTimeEntries] = useState<ITimeEntryDto[]>([]);

  useEffect(() => {
    sendRequestAsync(new GetStatisticsIntent())
      .then(res => {
        const statistics = res.response as unknown as IStatisticsDto;

        statisticEntryMap.current = statistics.timeEntries.reduce((acc: {[key:string]: ITimeEntryDto[]}, curr) => {
          acc[curr.activityName] = [...(acc[curr.activityName] ? acc[curr.activityName] : []), curr];
          return acc;
        }, {});

        setActivities(statistics.statistics);
      });
  }, []);

  const segments: IDonutSegment[] = useMemo(
    () => activities.map((activity: ITimeEntryDto) => ({
      label: activity.activityName,
      value: activity.duration,
      color: activity.color,
    })),
    [activities]
  );

  const segmentSelected  = (segment?: IDonutSegment|null) => {
    if (segment == null)
    {
      setTimeEntries([])
      return;
    }
    statisticEntryMap.current[segment.label] != null
      ? setTimeEntries(statisticEntryMap.current[segment.label])
      : setTimeEntries([]);
  }

  return <>
    <Flex direction={'column'}
          align={'stretch'}
          gap={'6'}
          flexGrow={'1'}
          padding={'6'}
          overflowY={'hidden'}
          className={classes.statistics}>

      {/* TODO: filter the statistics by the clicked activity */}
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
