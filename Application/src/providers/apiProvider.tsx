import * as React from 'react';
import {createContext, type JSX, useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Intent} from '../network/intent.ts';
import type {IResponse} from '../network/response.ts';
import {type Api, apiFactory} from '../network/api.ts';
import {rts} from '../common/routes.ts';
import type {IChildren} from '../interfaces/children.ts';


// region Interface

export interface IApiContext {
  setToken: (token: string) => void;
  sendRequestAsync: <T>(intent: Intent<T>) => Promise<IResponse<T>>;
}

// endregion

// region Context

const ApiContext: React.Context<IApiContext|null> = createContext<IApiContext|null>(null);

export const useApi = () => {
  const context: IApiContext|null = useContext(ApiContext);
  if (context == null) {
    throw new Error('useApi must be used within the ApiProvider');
  }

  return context;
}

// endregion

// region Provider

/**
 * A component that provides an API context to its children.
 *
 * ApiProvider is responsible for creating and managing an API instance
 * using the `apiFactory` function. It sets up the API context with methods
 * for sending requests and setting tokens, and makes these methods
 * available to all child components via the context API.
 *
 * @param {IChildren} props - The props containing the children components
 *                             to be wrapped with the API context.
 * @param {React.ReactNode} props.children - The child components that will
 *                                           have access to the API context.
 *
 * @returns {JSX.Element} A provider component that wraps its children
 *                        with the API context.
 */
export const ApiProvider = ({children}: IChildren): JSX.Element => {

  const [api] = useState<Api>(apiFactory(() => navigate(rts.Authentication)));
  const navigate = useNavigate();

  return <>
    <ApiContext.Provider value={{
      sendRequestAsync: api?.SendAsync ?? (() => new Promise<IResponse<null>>(r=>r({code: -1, response: null}))),
      setToken: api?.SetToken ?? (() => {})
    }}>
      {children}
    </ApiContext.Provider>
  </>
};

// endregion