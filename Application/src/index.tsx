import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// @ts-ignore
import './extensions/Extensions';
import App from './Components/App/App.tsx';
import {BrowserRouter} from 'react-router-dom';
import {ApiProvider} from './Providers/ApiProvider.tsx';
import {HeroUIProvider} from '@heroui/system';
import {ActivityProvider} from './Providers/ActivityProvider.tsx';
import {settings} from './Common/Settings.ts';
import {WorkspaceProvider} from './Providers/WorkspaceProvider.tsx';
import {ToastProvider} from '@heroui/react';

document.documentElement.classList.add(settings.GetTheme());

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HeroUIProvider locale={'en-GB'}>
      <ToastProvider />
      <BrowserRouter>
        <ApiProvider>
          <WorkspaceProvider>
            <ActivityProvider>
              <App />
            </ActivityProvider>
          </WorkspaceProvider>
        </ApiProvider>
      </BrowserRouter>
    </HeroUIProvider>
  </React.StrictMode>,
);
