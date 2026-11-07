import type {ReactNode} from 'react';
import {Button, Flex, Heading, IconButton, Spacer} from '@chakra-ui/react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
  LuActivity,
  LuBriefcase,
  LuChartColumn,
  LuLayoutDashboard,
  LuLogOut,
} from 'react-icons/lu';
import {rts} from '../common/routes.ts';
import {ColorModeButton} from './ui/colorMode.tsx';
import {useApi} from '../providers/apiProvider.tsx';

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
  const {setToken} = useApi();

  const isActive = (route: string) => location.pathname.startsWith(`/${rts.Home}/${route}`);

  /**
   * Signs the user out. The login page is loaded from scratch, so no data of the previous user
   * remains in the providers.
   */
  const logout = () => {
    setToken('');
    window.location.assign(`/${rts.Authentication}`);
  };

  return <>
    <Flex as={'nav'}
          alignItems={'center'}
          flexShrink={'0'}
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
      <Spacer/>
      <ColorModeButton/>
      <IconButton onClick={logout}
                  variant={'ghost'}
                  aria-label={'Log out'}
                  title={'Log out'}>
        <LuLogOut/>
      </IconButton>
    </Flex>
  </>;
};
