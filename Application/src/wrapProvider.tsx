import { WorkspaceProvider } from './providers/workspaceProvider';
import {ActivityProvider} from './providers/activityProvider.tsx';
import {ApiProvider} from './providers/apiProvider.tsx';
import type {IChildren} from './interfaces/children.ts';
import {Toaster} from './components/ui/toaster.tsx';
import {BrowserRouter} from 'react-router-dom';
import {ChakraProvider} from '@chakra-ui/react';
import {system} from './common/theme.ts';
import {ColorModeProvider} from './components/ui/colorMode.tsx';

export const WrapProvider = ({children}: IChildren) => {
  return <>
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <Toaster/>
        <BrowserRouter>
          <ApiProvider>
            <ActivityProvider>
              <WorkspaceProvider>
                {children}
              </WorkspaceProvider>
            </ActivityProvider>
          </ApiProvider>
        </BrowserRouter>
      </ColorModeProvider>
    </ChakraProvider>
  </>;
};
