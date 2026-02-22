import classes from './Home.module.scss';
import {Button, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem} from '@heroui/react';
import {Outlet} from 'react-router-dom';
import {rts} from '../../Common/Routes.ts';
import Svg from '../Svg/Svg.tsx';
import {settings} from '../../Common/Settings.ts';
import {useState} from 'react';

// region Interface

interface IProps {

}

// endregion

// region Component

const Home = ({}: IProps) => {

  const [theme, setTheme] = useState<string>(settings.GetTheme);

  const changeTheme = (theme: string) => {
    setTheme(theme);
    settings.SetTheme(theme);
    document.documentElement.classList.remove(theme == 'dark' ? 'light' : 'dark');
    document.documentElement.classList.add(settings.GetTheme());
  }

  return <>
    <div className={['flex','flex-col','grow', 'overflow-hidden'].join(' ')}>
      <Navbar isBordered
              maxWidth={'full'}>
        <NavbarBrand>
          <h1>Time Tracking</h1>
        </NavbarBrand>
        <NavbarContent justify={'center'}>
          <NavbarItem>
            <Link href={`/${rts.Home}/${rts.Overview}`}>Overview</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href={`/${rts.Home}/${rts.Workspaces}`}>Workspaces</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href={`/${rts.Home}/${rts.Activities}`}>Activities</Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify={'end'}>
          <Button color={'primary'}
                  isIconOnly
                  className={[ classes.themeButton ].join(' ')}
                  onPress={() => changeTheme(theme == 'dark' ? 'light' : 'dark')}>
            <Svg viewBox={'0 -960 960 960'}
                 path={
                  theme == 'dark'
                    ? 'M480-120q-151 0-255.5-104.5T120-480q0-138 90-239.5T440-838q13-2 23 3.5t16 14.5q6 9 6.5 21t-7.5 23q-17 26-25.5 55t-8.5 61q0 90 63 153t153 63q31 0 61.5-9t54.5-25q11-7 22.5-6.5T819-479q10 5 15.5 15t3.5 24q-14 138-117.5 229T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z'
                    : 'M565-395q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Zm-226.5 56.5Q280-397 280-480t58.5-141.5Q397-680 480-680t141.5 58.5Q680-563 680-480t-58.5 141.5Q563-280 480-280t-141.5-58.5ZM80-440q-17 0-28.5-11.5T40-480q0-17 11.5-28.5T80-520h80q17 0 28.5 11.5T200-480q0 17-11.5 28.5T160-440H80Zm720 0q-17 0-28.5-11.5T760-480q0-17 11.5-28.5T800-520h80q17 0 28.5 11.5T920-480q0 17-11.5 28.5T880-440h-80ZM451.5-771.5Q440-783 440-800v-80q0-17 11.5-28.5T480-920q17 0 28.5 11.5T520-880v80q0 17-11.5 28.5T480-760q-17 0-28.5-11.5Zm0 720Q440-63 440-80v-80q0-17 11.5-28.5T480-200q17 0 28.5 11.5T520-160v80q0 17-11.5 28.5T480-40q-17 0-28.5-11.5ZM226-678l-43-42q-12-11-11.5-28t11.5-29q12-12 29-12t28 12l42 43q11 12 11 28t-11 28q-11 12-27.5 11.5T226-678Zm494 495-42-43q-11-12-11-28.5t11-27.5q11-12 27.5-11.5T734-282l43 42q12 11 11.5 28T777-183q-12 12-29 12t-28-12Zm-42-495q-12-11-11.5-27.5T678-734l42-43q11-12 28-11.5t29 11.5q12 12 12 29t-12 28l-43 42q-12 11-28 11t-28-11ZM183-183q-12-12-12-29t12-28l43-42q12-11 28.5-11t27.5 11q12 11 11.5 27.5T282-226l-42 43q-11 12-28 11.5T183-183Zm297-297Z'
            }/>
          </Button>
        </NavbarContent>
      </Navbar>
      <div className={['m-2','flex-col','grow','flex', 'overflow-hidden'].join(' ')}>
        <Outlet/>
      </div>
    </div>
  </>;
};

// endregion

// region Export

export default Home;

// endregion