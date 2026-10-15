import {Button, CloseButton, Drawer, Field, For, Input, Portal, Textarea, ColorSwatch, Flex} from '@chakra-ui/react';
import type {IActivityDto} from '../network/intents/activities/activityDto.ts';
import {useState} from 'react';
import {HexToInt, IntToHex} from '../common/transformer.ts';
import {useActivity} from '../providers/activityProvider.tsx';

interface IProps {
  activity: IActivityDto|null;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  workspaceId: number;
}

export const ActivityDrawer = ({
  open,
  setOpen,
  activity,
  workspaceId,
}: IProps) => {


  const [name, setName] = useState<string>(activity?.name ?? '');
  const [description, setDescription] = useState<string>(activity?.description ?? '');

  const colors: string[] = ['#006FEE', '#7828C8', '#0E793C', '#C20E4D', '#992F7B', '#936316', '#053B48', '#71717A'];
  const [color, setColor] = useState<string>(
    activity == null
      ? colors[0]
      : IntToHex(activity.activityColor)
  );

  const { addActivity, updateActivity} = useActivity();

  return <>
    <Drawer.Root open={open}
                 onOpenChange={(e) => setOpen(e.open)}
                 size={'md'}>
      <Portal>
        <Drawer.Backdrop/>
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>{activity ? 'Edit Activity' : 'Add Activity'}</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Flex gap={'2em'}
                    direction={'column'}>
                <Field.Root>
                  <Field.Label marginLeft={'0.6em'}
                               fontSize={'1.25em'}
                               fontWeight={'bold'}>
                    Activity Name
                  </Field.Label>
                  <Input placeholder="Enter the Activity Name"
                         defaultValue={name}
                         onChange={(e) => setName(e.target.value)}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label marginLeft={'0.6em'}
                               fontSize={'1.25em'}
                               fontWeight={'bold'}>
                    Description
                  </Field.Label>
                  <Textarea defaultValue={description}
                            onChange={(e) => setDescription(e.target.value)}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label marginLeft={'0.6em'}
                               fontSize={'1.25em'}
                               fontWeight={'bold'}>
                    Color
                  </Field.Label>
                  <Flex gap={'0.75em'} align={'center'}>
                    <For each={colors}>
                      {
                        c => <ColorSwatch value={c}
                                          cursor={'pointer'}
                                          onClick={() => setColor(c)}
                                          size={c == color ? 'xl' : 'sm'}/>
                      }
                    </For>
                  </Flex>
                </Field.Root>
              </Flex>
            </Drawer.Body>
            <Drawer.Footer>
              <Button variant={'outline'}
                      onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() =>
                                  activity == null
                                    ? addActivity({name, description, activityColor: HexToInt(color)} as IActivityDto, workspaceId)
                                    : updateActivity({id: activity.id, name, description, activityColor: HexToInt(color)} as IActivityDto, workspaceId)}>
                Save
              </Button>
            </Drawer.Footer>
            <Drawer.CloseTrigger asChild>
              <CloseButton size={'md'} />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  </>;
};