import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {type Api, apiFactory} from '../network/api.ts';
import {rts} from '../common/routes.ts';
import type {IChildren} from '../interfaces/children.ts';
import {ApiContext} from './apiContext.ts';

/**
 * Provides the api to its children, unauthorized responses navigate to the login page.
 *
 * @param children The components using the api.
 */
export const ApiProvider = ({children}: IChildren) => {

  const navigate = useNavigate();
  const [api] = useState<Api>(() => apiFactory(() => navigate(`/${rts.Authentication}`)));

  return <>
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  </>;
};
