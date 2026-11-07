import {useState} from 'react';
import classes from './authentication.module.scss';
import {Button, Card, Field, Input, Stack} from '@chakra-ui/react';
import {useApi} from '../../providers/apiProvider.tsx';
import {AuthenticationIntent} from '../../network/intents/authentication/authenticationIntent.ts';
import {toaster} from '../../components/ui/toaster.tsx';
import {useNavigate} from 'react-router-dom';
import {rts} from '../../common/routes.ts';


/**
 * Authentication Page
 * @constructor
 */
export const Authentication = () => {

  const [ username, setUsername ] = useState<string>('');
  const [ password, setPassword ] = useState<string>('');
  const {sendRequestAsync, setToken} = useApi();
  const navigate = useNavigate();

  const login = async () => {

    const response = await sendRequestAsync(new AuthenticationIntent(username, password))

    if (response.code !== 200 || response.response === null) {
      toaster.create({description: 'Login failed', type: 'error'});
    }
    else {
      setToken(response.response.bearerToken);
      toaster.create({description: 'Successfully Logged in', type: 'success'});
      navigate(`../${rts.Home}`)
    }
  };

  const register = () => navigate(`../${rts.Register}`);

  return <>
    <div className={classes.background}>
      <Card.Root maxW={'sm'}
                 className={classes.loginBox}>
        <Card.Header>
          <Card.Title>Login</Card.Title>
          <Card.Description>
            Fill in the form below to Login to TimeTracking
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <Stack gap={'4'} w={'full'}>
            <Field.Root>
              <Field.Label>Username</Field.Label>
              <Input defaultValue={username}
                      onChange={(e) => setUsername(e.target.value)}/>
            </Field.Root>
            <Field.Root>
              <Field.Label>Password</Field.Label>
              <Input type={'password'}
                     defaultValue={password}
                     onChange={(e) => setPassword(e.target.value)}/>
            </Field.Root>
          </Stack>
        </Card.Body>
        <Card.Footer justifyContent={'flex-end'}>
          <Button variant={'outline'}
                  onClick={register}>
            Register
          </Button>
          <Button variant={'solid'}
                  onClick={login}>
            Login
          </Button>
        </Card.Footer>
      </Card.Root>
    </div>
  </>;
};