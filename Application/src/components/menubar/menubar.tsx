import type {ReactNode} from 'react';
import classes from './menubar.module.scss';
import {Button, Flex, Heading} from '@chakra-ui/react';
import {useLocation, useNavigate} from 'react-router-dom';
import {LuActivity, LuBriefcase, LuChartColumn, LuLayoutDashboard} from 'react-icons/lu';
import {rts} from '../../common/routes.ts';

interface IMenuItem {
  label: string;
  route: string;
  icon: ReactNode;
}

const items: IMenuItem[] = [
  {label: 'Overview', route: rts.Overview, icon: <LuLayoutDashboard/>},
  {label: 'Activities', route: rts.Activities, icon: <LuActivity/>},
  {label: 'Workspaces', route: rts.Workspaces, icon: <LuBriefcase/>},
  {label: 'Statistics', route: rts.Statistics, icon: <LuChartColumn/>}
];

/**
 * Menubar navigating the pages within the home route
 * @constructor
 */
export const Menubar = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (route: string) => location.pathname.startsWith(`/${rts.Home}/${route}`);

  return <>
    <Flex as={'nav'}
          className={classes.menubar}
          alignItems={'center'}
          gap={'2'}
          px={'4'}
          py={'2'}
          borderBottomWidth={'1px'}>
      <Heading size={'md'}
               mr={'4'}>
        TimeTracking
      </Heading>
      {items.map((item) =>
        <Button key={item.route}
                variant={isActive(item.route) ? 'solid' : 'ghost'}
                aria-current={isActive(item.route) ? 'page' : undefined}
                onClick={() => navigate(`/${rts.Home}/${item.route}`)}>
          {item.icon}
          {item.label}
        </Button>
      )}
    </Flex>
  </>;
};
