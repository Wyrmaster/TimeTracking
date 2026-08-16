import { WorkspaceProvider } from './providers/workspaceProvider';
import {ActivityProvider} from './providers/activityProvider.tsx';
import {ApiProvider} from './providers/apiProvider.tsx';
import type {IChildren} from './interfaces/children.ts';
import {Toaster} from './components/ui/toaster.tsx';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from './components/ui/provider.tsx';

export function WrapProvider({children}: IChildren) {
  return <>
    <Provider>
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
    </Provider>
  </>;
}
