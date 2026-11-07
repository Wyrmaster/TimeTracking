import {ApiProvider} from './providers/apiProvider.tsx';
import {WeekProvider} from './providers/weekProvider.tsx';
import type {IChildren} from './interfaces/children.ts';
import {Toaster} from './components/ui/toaster.tsx';
import {BrowserRouter} from 'react-router-dom';
import {ChakraProvider} from '@chakra-ui/react';
import {QueryClientProvider} from '@tanstack/react-query';
import {system} from './common/theme.ts';
import {queryClient} from './queryClient.ts';
import {ColorModeProvider} from './components/ui/colorMode.tsx';

export const WrapProvider = ({children}: IChildren) => {
  return <>
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <Toaster/>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ApiProvider>
              <WeekProvider>
                {children}
              </WeekProvider>
            </ApiProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ColorModeProvider>
    </ChakraProvider>
  </>;
};
