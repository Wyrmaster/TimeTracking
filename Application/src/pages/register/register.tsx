import {useState} from 'react';
import classes from './register.module.scss';
import {useApi} from '../../providers/apiContext.ts';
import {useNavigate} from 'react-router-dom';
import {Button, Card, Field, Input, Stack} from '@chakra-ui/react';
import {RegisterIntent} from '../../network/intents/authentication/registerIntent.ts';
import {rts} from '../../common/routes.ts';
import {toaster} from '../../components/ui/toaster.tsx';


export const Register = () => {
  const [ username, setUsername ] = useState<string>('');
  const [ password1, setPassword1 ] = useState<string>('');
  const [ password2, setPassword2 ] = useState<string>('');
  const {sendAsync, setToken} = useApi();
  const navigate = useNavigate();

  const passwordsDiffer: boolean = password2.length > 0 && password1 != password2;
  const canRegister: boolean = username.length > 0 && password1.length > 0 && password1 == password2;

  const register = async () => {
    if (!canRegister) {
      return;
    }

    const response = await sendAsync(new RegisterIntent({
      username,
      password: password1,
    }));

    if (response.code == 409) {
      toaster.create({description: 'This username is already taken...', type: 'error'});
    }
    else if (response.code != 200 || response.response == null) {
      toaster.create({description: 'Failed to register new user...', type: 'error'});
    }
    else {
      setToken(response.response.bearerToken);
      navigate(`../${rts.Home}`);
      toaster.create({description: 'Registered new User', type: 'success'});
    }
  };

  return <>
    <div className={classes.background}>
      <Card.Root maxW={'sm'}
                 className={classes.registerBox}>
        <Card.Header>
          <Card.Title>Register</Card.Title>
          <Card.Description>
            Fill in the form below to Register a user in TimeTracking
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
                     defaultValue={password1}
                     onChange={(e) => setPassword1(e.target.value)}/>
            </Field.Root>
            <Field.Root invalid={passwordsDiffer}>
              <Field.Label>Password Confirmation</Field.Label>
              <Input type={'password'}
                     defaultValue={password2}
                     onChange={(e) => setPassword2(e.target.value)}/>
              <Field.ErrorText>The passwords do not match.</Field.ErrorText>
            </Field.Root>
          </Stack>
        </Card.Body>
        <Card.Footer justifyContent={'flex-end'}>
          <Button variant={'outline'}
                  disabled={!canRegister}
                  onClick={register}>
            Register
          </Button>
        </Card.Footer>
      </Card.Root>
    </div>
  </>;
};