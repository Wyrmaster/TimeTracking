import {createContext, useContext} from 'react';
import type {Api} from '../network/api.ts';

// region Interface

export type IApiContext = Pick<Api, 'sendAsync' | 'requestAsync' | 'downloadAsync' | 'setToken'>;

// endregion

// region Context

export const ApiContext = createContext<IApiContext|null>(null);

/**
 * Gives access to the api, must be used within the `ApiProvider`
 */
export const useApi = (): IApiContext => {
  const context: IApiContext|null = useContext(ApiContext);

  if (context == null) {
    throw new Error('useApi must be used within the ApiProvider');
  }

  return context;
};

// endregion
