import classes from './overview.module.scss';
import {Button, Flex, HStack} from '@chakra-ui/react';
import {useActivity} from '../../providers/activityProvider.tsx';
import {TimeTable} from '../../components/timeTable/timeTable.tsx';

/**
 * Page showing the time entries of the selected week within a time table.
 * @constructor
 */
export const Overview = () => {

  const {timeEntries, weekDays, date, setDate} = useActivity();



  return <>
    <Flex direction={'column'}
          flex={'1'}
          minHeight={'0'}
          className={classes.overview}>
      <HStack>
        <Button onClick={() => setDate(date.add({days: -7}))}>Previous Week</Button>
      </HStack>

      <TimeTable timeEntries={timeEntries}
                 days={weekDays}/>
    </Flex>
  </>;
};
