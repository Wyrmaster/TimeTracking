import {useCallback} from 'react';
import {type QueryKey, useQueryClient} from '@tanstack/react-query';

/**
 * Returns a function marking the cached data of the given query keys as outdated, so it is fetched again.
 */
export const useInvalidate = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (keys: readonly QueryKey[]) => Promise.all(keys.map(queryKey => queryClient.invalidateQueries({queryKey}))),
    [queryClient],
  );
};
