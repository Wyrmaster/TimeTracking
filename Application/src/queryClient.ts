import {MutationCache, QueryCache, QueryClient} from '@tanstack/react-query';
import {toaster} from './components/ui/toaster.tsx';
import './queries/queryMeta.ts';

/**
 * Cache of the api data. The messages declared in the `meta` of queries and mutations are shown as toasts here,
 * so the data hooks stay free of ui concerns.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (_, query) => {
      if (query.meta?.errorMessage != null) {
        toaster.create({description: query.meta.errorMessage, type: 'error'});
      }
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      if (mutation.meta?.successMessage != null) {
        toaster.create({description: mutation.meta.successMessage, type: 'success'});
      }
    },
    onError: (_error, _variables, _context, mutation) => {
      if (mutation.meta?.errorMessage != null) {
        toaster.create({description: mutation.meta.errorMessage, type: 'error'});
      }
    },
  }),
  defaultOptions: {
    queries: {
      // a failed request is shown once instead of being retried silently
      retry: false,
      staleTime: 30_000,
    },
  },
});
