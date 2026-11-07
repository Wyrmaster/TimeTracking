import {useState} from 'react';
import {
  Button,
  Card,
  Field,
  Flex,
  Input,
  NativeSelect,
  SegmentGroup,
  Stack,
  Switch,
} from '@chakra-ui/react';
import {type ColorModePreference, useColorMode} from '../../components/ui/colorMode.tsx';
import {useWeek} from '../../providers/weekContext.ts';
import {useChangePassword} from '../../queries/account.ts';

/**
 * Selectable color modes and their labels
 */
const COLOR_MODES: {value: ColorModePreference, label: string}[] = [
  {value: 'system', label: 'System'},
  {value: 'light', label: 'Light'},
  {value: 'dark', label: 'Dark'},
];

/**
 * Week days in the order of `Date.getDay()` (0 = Sunday)
 */
const WEEK_DAYS: string[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Card choosing the color mode of the application
 */
const AppearanceSettings = () => {
  const {preference, setColorMode} = useColorMode();

  return <>
    <Card.Root>
      <Card.Header>
        <Card.Title>Appearance</Card.Title>
      </Card.Header>
      <Card.Body>
        <Field.Root>
          <Field.Label>Theme</Field.Label>
          <SegmentGroup.Root value={preference}
                             onValueChange={(e) => setColorMode(e.value as ColorModePreference)}>
            <SegmentGroup.Indicator/>
            <SegmentGroup.Items items={COLOR_MODES}/>
          </SegmentGroup.Root>
          <Field.HelperText>System follows the color scheme of the operating system.</Field.HelperText>
        </Field.Root>
      </Card.Body>
    </Card.Root>
  </>;
};

/**
 * Card configuring how weeks are shown in the overview and the statistics presets
 */
const WeekSettings = () => {
  const {
    useWorkWeek,
    setUseWorkWeek,
    firstDayOfTheWeek,
    setFirstDayOfTheWeek,
  } = useWeek();

  return <>
    <Card.Root>
      <Card.Header>
        <Card.Title>Week</Card.Title>
      </Card.Header>
      <Card.Body>
        <Stack gap={'6'}>
          <Field.Root>
            <Switch.Root checked={useWorkWeek}
                         onCheckedChange={(e) => setUseWorkWeek(e.checked)}>
              <Switch.HiddenInput/>
              <Switch.Control/>
              <Switch.Label>Only show the work week</Switch.Label>
            </Switch.Root>
            <Field.HelperText>The overview shows monday to friday only.</Field.HelperText>
          </Field.Root>
          <Field.Root disabled={useWorkWeek}>
            <Field.Label>First day of the week</Field.Label>
            <NativeSelect.Root maxWidth={'xs'}>
              <NativeSelect.Field value={firstDayOfTheWeek}
                                  onChange={(e) => setFirstDayOfTheWeek(parseInt(e.target.value))}>
                {WEEK_DAYS.map((day: string, index: number) =>
                  <option key={day}
                          value={index}>
                    {day}
                  </option>,
                )}
              </NativeSelect.Field>
              <NativeSelect.Indicator/>
            </NativeSelect.Root>
            <Field.HelperText>
              Used by the overview for full weeks and by the week presets of the statistics.
            </Field.HelperText>
          </Field.Root>
        </Stack>
      </Card.Body>
    </Card.Root>
  </>;
};

/**
 * Card changing the password of the user
 */
const AccountSettings = () => {
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmation, setConfirmation] = useState<string>('');
  const changePassword = useChangePassword();

  const passwordsDiffer: boolean = confirmation.length > 0 && newPassword != confirmation;
  const canChange: boolean = oldPassword.length > 0 && newPassword.length > 0 && newPassword == confirmation;

  const change = () => {
    changePassword.mutate(
      {oldPassword, newPassword},
      {
        onSuccess: () => {
          setOldPassword('');
          setNewPassword('');
          setConfirmation('');
        },
      },
    );
  };

  return <>
    <Card.Root>
      <Card.Header>
        <Card.Title>Account</Card.Title>
      </Card.Header>
      <Card.Body>
        <Stack gap={'4'}
               maxWidth={'sm'}>
          <Field.Root>
            <Field.Label>Current password</Field.Label>
            <Input type={'password'}
                   autoComplete={'current-password'}
                   value={oldPassword}
                   onChange={(e) => setOldPassword(e.target.value)}/>
          </Field.Root>
          <Field.Root>
            <Field.Label>New password</Field.Label>
            <Input type={'password'}
                   autoComplete={'new-password'}
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}/>
          </Field.Root>
          <Field.Root invalid={passwordsDiffer}>
            <Field.Label>Confirm new password</Field.Label>
            <Input type={'password'}
                   autoComplete={'new-password'}
                   value={confirmation}
                   onChange={(e) => setConfirmation(e.target.value)}/>
            <Field.ErrorText>The passwords do not match.</Field.ErrorText>
          </Field.Root>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Button disabled={!canChange}
                loading={changePassword.isPending}
                onClick={change}>
          Change password
        </Button>
      </Card.Footer>
    </Card.Root>
  </>;
};

/**
 * Page with the settings of the user
 */
export const Settings = () => {
  return <>
    <Flex flex={'1'}
          overflowY={'auto'}
          justify={'center'}>
      <Stack gap={'6'}
             padding={'1.5em'}
             width={'full'}
             maxWidth={'3xl'}>
        <AppearanceSettings/>
        <WeekSettings/>
        <AccountSettings/>
      </Stack>
    </Flex>
  </>;
};
