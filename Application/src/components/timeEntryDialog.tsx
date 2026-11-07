import {useEffect, useState} from 'react';
import {
  Box,
  Button,
  CloseButton,
  Combobox,
  Dialog,
  Field,
  HStack,
  Input,
  Portal,
  Spinner,
  Text,
  useFilter,
  useListCollection,
  VStack
} from '@chakra-ui/react';
import type {ITimeEntryDto} from '../network/intents/timeEntry/timeEntryDto.ts';
import type {IActivityDto} from '../network/intents/activities/activityDto.ts';
import {useActivity} from '../providers/activityProvider.tsx';
import {IntToHex} from '../common/transformer.ts';
import {asDate} from '../common/timeGrid.ts';

/**
 * AI GENERATED
 */


interface IProps {
  timeEntry: ITimeEntryDto;
  mode?: 'create' | 'edit';
  open: boolean;
  setOpen: (open: boolean) => void;
}

/**
 * Formats a date as the value of a `datetime-local` input (`YYYY-MM-DDTHH:mm`).
 * @param date The date to format.
 */
const toDateTimeInput = (date: Date): string =>
  `${date.getFullYear()}`
  + `-${(date.getMonth() + 1).toString().padStart(2, '0')}`
  + `-${date.getDate().toString().padStart(2, '0')}`
  + `T${date.getHours().toString().padStart(2, '0')}`
  + `:${date.getMinutes().toString().padStart(2, '0')}`;

/**
 * Formats the duration between two points in time as `HHh MMm`.
 * @param start The start of the duration.
 * @param end The end of the duration.
 */
const formatDuration = (start: Date, end: Date): string => {
  const minutes: number = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));

  return `${Math.floor(minutes / 60)}h ${(minutes % 60).toString().padStart(2, '0')}m`;
};

/**
 * Dialog used to edit the timestamps and the activity of a single time entry, or to create a
 * new time entry manually.
 *
 * The dialog is meant to be mounted per time entry (e.g. keyed by the selected entry), its
 * form state is therefore initialized from the given time entry and not synchronized afterward.
 *
 * When creating a time entry, the end, and the activity are required and a description can be
 * provided.
 *
 * @param timeEntry The time entry that is being edited or used as template for the new one.
 * @param mode Whether an existing time entry is edited or a new one is created.
 * @param open Whether the dialog is currently visible.
 * @param setOpen Callback used to change the visibility of the dialog.
 */
export const TimeEntryDialog = ({timeEntry, mode = 'edit', open, setOpen}: IProps) => {

  const {loadActivities, updateTimeEntry, addTimeEntry} = useActivity();

  const isCreating: boolean = mode == 'create';

  const [activities, setActivities] = useState<IActivityDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [start, setStart] = useState<string>(toDateTimeInput(asDate(timeEntry.start)));
  const [end, setEnd] = useState<string>(timeEntry.end == null ? '' : toDateTimeInput(asDate(timeEntry.end)));
  const [activityId, setActivityId] = useState<number|null>(timeEntry.activity?.id ?? null);
  const [description, setDescription] = useState<string>(timeEntry.description ?? '');

  const {contains} = useFilter({sensitivity: 'base'});
  const {collection, filter, set} = useListCollection<IActivityDto>({
    initialItems: [],
    itemToString: activity => activity.name,
    itemToValue: activity => activity.id.toString(),
    filter: contains
  });

  const startDate: Date = new Date(start);
  const endDate: Date|null = end.length == 0 ? null : new Date(end);

  const startInvalid: boolean = start.length == 0 || isNaN(startDate.getTime());
  const endInvalid: boolean = endDate == null
    ? isCreating
    : isNaN(endDate.getTime()) || endDate.getTime() <= startDate.getTime();
  const activityMissing: boolean = isCreating && activityId == null;

  /**
   * Persists the edited time entry and closes the dialog.
   */
  const save = async () => {
    if (startInvalid || endInvalid || activityMissing) {
      return;
    }

    setSaving(true);

    const editedTimeEntry: ITimeEntryDto = {
      ...timeEntry,
      description: isCreating ? description : timeEntry.description,
      start: startDate,
      end: endDate,
      activity: activityId == null
        ? null
        : activities.find(activity => activity.id == activityId) ?? timeEntry.activity
    };

    if (isCreating) {
      await addTimeEntry(editedTimeEntry);
    }
    else {
      await updateTimeEntry(editedTimeEntry);
    }

    setSaving(false);
    setOpen(false);
  };

  useEffect(() => {
    loadActivities(null, setLoading)
      .then(loadedActivities => {
        setActivities(loadedActivities);
        set(loadedActivities);
      });
  }, []);

  return <>
    <Dialog.Root open={open}
                 onOpenChange={details => setOpen(details.open)}
                 size={'sm'}
                 placement={'center'}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{isCreating ? 'New Time Entry' : 'Edit Time Entry'}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={'1em'}
                      alignItems={'stretch'}>
                <Field.Root invalid={startInvalid}>
                  <Field.Label>Start</Field.Label>
                  <Input type={'datetime-local'}
                         value={start}
                         onChange={event => setStart(event.target.value)}/>
                  <Field.ErrorText>Please provide a valid start.</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={endInvalid}>
                  <Field.Label>End</Field.Label>
                  <Input type={'datetime-local'}
                         value={end}
                         onChange={event => setEnd(event.target.value)}/>
                  <Field.HelperText>
                    {
                      endDate == null
                        ? 'Leave empty to keep this time entry running.'
                        : `Duration: ${formatDuration(startDate, endDate)}`
                    }
                  </Field.HelperText>
                  <Field.ErrorText>
                    {endDate == null ? 'Please provide an end.' : 'The end has to be after the start.'}
                  </Field.ErrorText>
                </Field.Root>

                <Combobox.Root collection={collection}
                               invalid={activityMissing}
                               value={activityId == null ? [] : [activityId.toString()]}
                               defaultInputValue={timeEntry.activity?.name ?? ''}
                               onValueChange={details => setActivityId(
                                 details.value.length == 0 ? null : parseInt(details.value[0])
                               )}
                               onInputValueChange={details => filter(details.inputValue)}
                               openOnClick>
                  <Combobox.Label>Activity</Combobox.Label>
                  <Combobox.Control>
                    <Combobox.Input placeholder={'Select an activity'}/>
                    <Combobox.IndicatorGroup>
                      {loading ? <Spinner size={'xs'} borderWidth={'1.5px'}/> : <Combobox.ClearTrigger/>}
                      <Combobox.Trigger/>
                    </Combobox.IndicatorGroup>
                  </Combobox.Control>
                  <Combobox.Positioner>
                    <Combobox.Content>
                      <Combobox.Empty>
                        {loading ? 'Loading activities...' : 'No activities found'}
                      </Combobox.Empty>
                      {collection.items.map(activity => (
                        <Combobox.Item item={activity}
                                       key={activity.id}>
                          <HStack gap={'0.5em'}>
                            <Box boxSize={'0.75em'}
                                 rounded={'full'}
                                 bg={IntToHex(activity.activityColor)}/>
                            <Combobox.ItemText>{activity.name}</Combobox.ItemText>
                          </HStack>
                          <Combobox.ItemIndicator/>
                        </Combobox.Item>
                      ))}
                    </Combobox.Content>
                  </Combobox.Positioner>
                </Combobox.Root>

                {
                  isCreating
                    ? <Field.Root>
                        <Field.Label>Description</Field.Label>
                        <Input value={description}
                               placeholder={'What did you work on?'}
                               onChange={event => setDescription(event.target.value)}/>
                      </Field.Root>
                    : <Text textStyle={'xs'}
                            color={'fg.muted'}>
                        {timeEntry.description}
                      </Text>
                }
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant={'outline'}>Cancel</Button>
              </Dialog.ActionTrigger>
              <Button variant={'solid'}
                      loading={saving}
                      disabled={startInvalid || endInvalid || activityMissing}
                      onClick={save}>
                Save
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size={'sm'}/>
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  </>;
};
