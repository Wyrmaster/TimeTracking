import { WorkspaceProvider } from './providers/workspaceProvider';
import {ActivityProvider} from './providers/activityProvider.tsx';
import {ApiProvider} from './providers/apiProvider.tsx';
import type {IChildren} from './interfaces/children.ts';
import {Toaster} from './components/ui/toaster.tsx';
import {BrowserRouter} from 'react-router-dom';
import {ChakraProvider, defaultSystem} from '@chakra-ui/react';

export function WrapProvider({children}: IChildren) {
  return <>
    <ChakraProvider value={defaultSystem}>
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
    </ChakraProvider>
  </>;
}
