import classes from './home.module.scss';
import {Outlet} from 'react-router-dom';
import {Flex} from '@chakra-ui/react';
import {Menubar} from '../../components/menubar.tsx';
import {useTrackingSync} from '../../queries/tracking.ts';

/**
 * Layout of the pages available after logging in
 */
export const Home = () => {

  useTrackingSync();

  return <>
    <Flex direction={'column'}
          className={classes.home}>
      <Menubar/>
      <Flex flex={'1'}
            minHeight={'0'}
            position={'relative'}
            overflow={'hidden'}>
        <Outlet/>
      </Flex>
    </Flex>
  </>;
};
