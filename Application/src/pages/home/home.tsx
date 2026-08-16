import classes from './home.module.scss';
import {Outlet} from 'react-router-dom';
import {Flex} from '@chakra-ui/react';
import {Menubar} from '../../components/menubar/menubar.tsx';

export const Home = () => {
  return <>
    <Flex direction={'column'}
          className={classes.home}>
      <Menubar/>
      <Flex flex={'1'}
            minHeight={'0'}
            overflow={'hidden'}>
        <Outlet/>
      </Flex>
    </Flex>
  </>;
};