import classes from './Authentication.module.scss';
import {Button, Input} from '@heroui/react';
import {useState} from 'react';
import {useApi} from '../../Providers/ApiProvider.tsx';
import {AuthenticationIntent} from '../../Network/Intents/Authentication/AuthenticationIntent.ts';
import {settings} from '../../Common/Settings.ts';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import {rts} from '../../Common/Routes.ts';

// region Component

/**
 * Login component
 */
const Authentication = () => {

  const [user, setUser] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const {sendRequestAsync, setToken} = useApi();

  const navigate: NavigateFunction = useNavigate();

  const handleLogin = async () => {
    const response = await sendRequestAsync(new AuthenticationIntent(user, password));
    if (response.code == 200) {
      settings.SetToken(response.response!.bearerToken);
      setToken(response.response!.bearerToken);
      navigate(`../${rts.Home}`);
    }
  }

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