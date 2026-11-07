import classes from './home.module.scss';
import {Outlet} from 'react-router-dom';
import {Flex} from '@chakra-ui/react';
import {Menubar} from '../../components/menubar.tsx';
import {useWorkspace} from '../../providers/workspaceProvider.tsx';
import {useEffect} from 'react';

export const Home = () => {
  const { loadWorkspaces } = useWorkspace();

  useEffect(() => {
    loadWorkspaces().then();
  }, []);

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