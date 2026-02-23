import * as React from 'react';
import {createContext, useContext, useState} from 'react';
import {Intent} from '../Network/Intent.ts';
import {Api, apiFactory} from '../Network/Api.ts';
import {IChildren} from '../Interfaces/IChildren.ts';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import {rts} from '../Common/Routes.ts';
import {IResponse} from '../Network/IResponse.ts';

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

export const ApiProvider = ({children}: IChildren) => {

  const [api] = useState<Api>(apiFactory(() => navigate(rts.Authentication)));
  const navigate: NavigateFunction = useNavigate();

  return <>
    <ApiContext.Provider value={{
      sendRequestAsync: api?.SendAsync ?? (_ => new Promise<IResponse<null>>(r=>r({code: -1, response: null}))),
      setToken: api?.SetToken ?? (_ => {})
    }}>
      {children}
    </ApiContext.Provider>
  </>
};

// endregion