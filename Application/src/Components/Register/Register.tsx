import classes from './Register.module.scss';
import {addToast, Button, Input} from '@heroui/react';
import {useState} from 'react';
import {IResponse} from '../../Network/IResponse.ts';
import {IToken} from '../../Network/Intents/Authentication/IToken.ts';
import {useApi} from '../../Providers/ApiProvider.tsx';
import {RegisterIntent} from '../../Network/Intents/Authentication/RegisterIntent.ts';
import {settings} from '../../Common/Settings.ts';
import {rts} from '../../Common/Routes.ts';
import {NavigateFunction, useNavigate} from 'react-router-dom';

// region Interface

interface IProps {

}

// endregion

// region Component

/**
 * The Register component provides a user interface for registering a new user account.
 * It includes input fields for username, password, and password confirmation, along with a registration button.
 * The component handles form validation, API requests for registration, and navigation upon successful registration.
 * Error handling and success messages are displayed based on the outcomes of the registration process.
 *
 * Dependencies:
 * - useApi: Custom hook to manage API requests and token handling.
 * - useNavigate: Navigation function for moving between routes.
 * - useState: React hook for managing state variables.
 *
 * State Variables:
 * - user: Stores the username entered by the user.
 * - firstPassword: Stores the primary password entered by the user.
 * - secondPassword: Stores the password confirmation entered by the user.
 *
 * Functions:
 * - handleRegister: Asynchronous function triggered upon pressing the registration button.
 *   It validates the input, sends a registration request to the server, and handles token storage
 *   and navigation based on the server response.
 *
 * UI Elements:
 * - User input field for entering the username (required).
 * - Password input field for entering the primary password (required).
 * - Repeat Password input field for confirming the primary password (required).
 * - Register button, enabled only when inputs are valid, sends the registration request upon clicking.
 */
const Register = ({}: IProps) => {

  const { sendRequestAsync, setToken } = useApi();
  const navigate: NavigateFunction = useNavigate();

  const [user, setUser] = useState<string>('');
  const [firstPassword, setFirstPassword] = useState<string>('');
  const [secondPassword, setSecondPassword] = useState<string>('');

  /**
   * Asynchronous function used to handle the user registration process.
   * It sends a registration request with the provided username and password,
   * and processes the response to manage application state and navigation.
   *
   * On successful registration:
   * - Saves the bearer token for future authenticated requests.
   * - Updates application state and navigates the user to the home route.
   * - Displays a success toast message to indicate successful registration.
   *
   * On registration failure:
   * - Displays an error toast message to notify the user of the failure.
   *
   * The function relies on helper modules or utilities for sending requests,
   * managing settings, navigation, and toast notifications.
   *
   * @async
   * @function
   */
  const handleRegister = async () => {
    const response: IResponse<IToken> = await sendRequestAsync(new RegisterIntent({
      username: user,
      password: firstPassword
    }));
    if (response.code == 200) {
      settings.SetToken(response.response!.bearerToken);
      setToken(response.response!.bearerToken);
      navigate(`../${rts.Home}`);
      addToast({title:'Registered new User', description:'logging in...', color:'success'});
    }
    else {
      addToast({title:'Registration Failure', description:'Failed to register new user...', color:'danger'});
    }
  }

  return <>
    <div className={['m-4', classes.register].join(' ')}>
      <div className={[classes.registerBox, 'gap-4'].join(' ')}>
        <Input label={'User'}
               content={user}
               required={true}
               onChange={ev => setUser(ev.target.value)}/>
        <Input label={'Password'}
               type={'password'}
               content={firstPassword}
               required={true}
               onChange={ev => setFirstPassword(ev.target.value)}/>
        <Input label={'Repeat Password'}
               type={'password'}
               content={secondPassword}
               required={true}
               onChange={ev => setSecondPassword(ev.target.value)}/>
        <Button color={'primary'}
                isDisabled={user.length == 0
                  || firstPassword.length == 0
                  || secondPassword.length == 0
                  || firstPassword != secondPassword
                }
                onPress={handleRegister}>
          Register
        </Button>
      </div>
    </div>
  </>;
};

// endregion

// region Export

export default Register;

// endregion