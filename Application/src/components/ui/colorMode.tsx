import {IconButton} from '@chakra-ui/react';
import {ThemeProvider, useTheme} from 'next-themes';
import {LuMoon, LuSun} from 'react-icons/lu';
import type {IChildren} from '../../interfaces/children.ts';

export type ColorMode = 'light' | 'dark';

/**
 * Key the selected color mode is persisted with in the local storage
 */
const STORAGE_KEY: string = 'TimeTracker_Theme';

/**
 * Provides the color mode of the application.
 *
 * Follows the color scheme of the operating system until the user picks a color mode, the picked
 * color mode is persisted in the local storage.
 */
export const ColorModeProvider = ({children}: IChildren) =>
  <ThemeProvider attribute={'class'}
                 defaultTheme={'system'}
                 storageKey={STORAGE_KEY}
                 enableSystem
                 disableTransitionOnChange>
    {children}
  </ThemeProvider>;

/**
 * Gives access to the resolved color mode and allows switching it.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useColorMode = () => {
  const {resolvedTheme, setTheme} = useTheme();

  const colorMode: ColorMode = resolvedTheme == 'dark' ? 'dark' : 'light';

  return {
    colorMode,
    setColorMode: (mode: ColorMode) => setTheme(mode),
    toggleColorMode: () => setTheme(colorMode == 'dark' ? 'light' : 'dark'),
  };
};

/**
 * Button switching between the light and the dark color mode.
 */
export const ColorModeButton = () => {
  const {colorMode, toggleColorMode} = useColorMode();

  return <IconButton onClick={toggleColorMode}
                     variant={'ghost'}
                     aria-label={colorMode == 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                     title={colorMode == 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
    {colorMode == 'dark' ? <LuSun/> : <LuMoon/>}
  </IconButton>;
};
