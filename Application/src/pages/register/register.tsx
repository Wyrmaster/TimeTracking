import {useState} from 'react';
import classes from './register.module.scss';
import {useApi} from '../../providers/apiProvider.tsx';
import {useNavigate} from 'react-router-dom';
import {Button, Card, Field, Input, Stack} from '@chakra-ui/react';
import {RegisterIntent} from '../../network/intents/authentication/registerIntent.ts';
import {rts} from '../../common/routes.ts';
import {toaster} from '../../components/ui/toaster.tsx';


export const Register = () => {
  const [ username, setUsername ] = useState<string>('');
  const [ password1, setPassword1 ] = useState<string>('');
  const [ password2, setPassword2 ] = useState<string>('');
  const {sendRequestAsync,setToken} = useApi();
  const navigate = useNavigate();

  const register = async () => {
    const response = await sendRequestAsync(new RegisterIntent({
      username,
      password: password1,
    }));

    if (response.code != 200 || response.response == null) {
      toaster.create({description:'Failed to register new user...', type:'error'});
    }
    else {
      setToken(response.response.bearerToken);
      navigate(`../${rts.Home}`);
      toaster.create({description:'Registered new User', type:'success'});
    }
  }

  return <>
    <div className={classes.background}>
      <Card.Root maxW={'sm'}
                 className={classes.registerBox}>
        <Card.Header>
          <Card.Title>Login</Card.Title>
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
            <Field.Root>
              <Field.Label>Password Confirmation</Field.Label>
              <Input type={'password'}
                     defaultValue={password2}
                     onChange={(e) => setPassword2(e.target.value)}/>
            </Field.Root>
          </Stack>
        </Card.Body>
        <Card.Footer justifyContent={'flex-end'}>
          <Button variant={'outline'}
                  onClick={register}>
            Register
          </Button>
        </Card.Footer>
      </Card.Root>
    </div>
  </>;
};