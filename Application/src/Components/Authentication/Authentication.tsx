import classes from './Authentication.module.scss';
import {addToast, Button, Input} from '@heroui/react';
import {useState} from 'react';
import {useApi} from '../../Providers/ApiProvider.tsx';
import {AuthenticationIntent} from '../../Network/Intents/Authentication/AuthenticationIntent.ts';
import {settings} from '../../Common/Settings.ts';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import {rts} from '../../Common/Routes.ts';

// region Component

/**
 * Authentication component that handles user login and navigation.
 *
 * This component provides a user interface for entering login credentials
 * and performs authentication by interacting with an API service. It also
 * includes navigation to the registration page.
 *
 * State Variables:
 * - `user` (string): Stores the username entered by the user.
 * - `password` (string): Stores the password entered by the user.
 *
 * Hooks:
 * - `useApi()`: Custom hook to access API-related functionality such as `sendRequestAsync` and `setToken`.
 * - `useNavigate()`: React Router hook for navigation.
 *
 * Functions:
 * - `handleLogin`: Asynchronously handles login by sending the user credentials to the API.
 *   On successful login, sets the authentication token, navigates to the home page,
 *   and displays a success toast. On failure, displays an error toast.
 * - `handleRegister`: Navigates the user to the registration page.
 */
const Authentication = () => {

  const [user, setUser] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const {sendRequestAsync, setToken} = useApi();

  const navigate: NavigateFunction = useNavigate();

  /**
   * Handles the login process for a user by initiating an authentication request
   * and processing the server's response.
   *
   * This function sends an authentication request with user credentials, processes
   * the server's response, and updates the application state based on the outcome.
   * On successful login, it stores the authentication token, navigates to the home
   * route, and displays a success notification. On failure, it displays an error
   * notification to inform the user of the login failure.
   */
  const handleLogin = async () => {
    const response = await sendRequestAsync(new AuthenticationIntent(user, password));
    if (response.code == 200) {
      settings.SetToken(response.response!.bearerToken);
      setToken(response.response!.bearerToken);
      navigate(`../${rts.Home}`);
      addToast({title:'Logged In', color:'success'});
    }
    else {
      addToast({title:'Login Failure', description:'Failed to login with the given credentials...', color:'danger'});
    }
  }

  /**
   * Navigates the user to the registration page.
   */
  const handleRegister = () => {
    navigate(`../${rts.Register}`);
  }

  return <>
    <div className={['m-4', classes.authentication].join(' ')}>
      <div className={[classes.loginBox, 'gap-4'].join(' ')}>
        <Input label={'User'}
               content={user}
               onChange={ev => setUser(ev.target.value)}/>
        <Input label={'Password'}
               type={'password'}
               content={password}
               onChange={ev => setPassword(ev.target.value)}/>
        <div className={['grow', 'flex', 'flex-row'].join(' ')}>
          <Button color={'default'}
                  variant={'flat'}
                  onPress={handleRegister}>
            Register
          </Button>

          <div className={'grow'}/>

          <Button color={'primary'}
                  isDisabled={user.length == 0 || password.length == 0}
                  onPress={handleLogin}>
            Login
          </Button>
        </div>
      </div>
    </div>
  </>;
};

// endregion

// region Export

export default Authentication;

// endregion