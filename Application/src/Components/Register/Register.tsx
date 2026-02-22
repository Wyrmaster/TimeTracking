import classes from './Register.module.scss';
import {Button, Input} from '@heroui/react';
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

const Register = ({}: IProps) => {

  const { sendRequestAsync, setToken } = useApi();
  const navigate: NavigateFunction = useNavigate();

  const [user, setUser] = useState<string>('');
  const [firstPassword, setFirstPassword] = useState<string>('');
  const [secondPassword, setSecondPassword] = useState<string>('');

  const handleRegister = async () => {
    const response: IResponse<IToken> = await sendRequestAsync(new RegisterIntent({
      username: user,
      password: firstPassword
    }));
    if (response.code == 200) {
      settings.SetToken(response.response!.bearerToken);
      setToken(response.response!.bearerToken);
      navigate(`../${rts.Home}`);
    }
    else {

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