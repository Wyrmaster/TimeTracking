import {Badge, For, HStack, IconButton, Table} from '@chakra-ui/react';
import {FaToggleOn} from 'react-icons/fa6';
import {MdAdd, MdModeEdit} from 'react-icons/md';
import {RemoveWorkspace} from '../../components/removeWorkspace.tsx';
import type {IWorkspaceDto} from '../../network/intents/workspace/workspaceDto.ts';
import {useState} from 'react';
import {WorkspaceDrawer} from '../../components/workspaceDrawer.tsx';
import {useSetActiveWorkspace, useWorkspaces} from '../../queries/workspaces.ts';

/**
 * Stable placeholder while loading
 */
const NO_WORKSPACES: IWorkspaceDto[] = [];

/**
 * Page listing the workspaces of the user, a workspace can be activated, edited or removed
 */
export const Workspaces = () => {
  const {data: workspaces = NO_WORKSPACES} = useWorkspaces();
  const setActiveWorkspace = useSetActiveWorkspace();
  const [workspaceToEdit, setWorkspaceToEdit] = useState<IWorkspaceDto|null>(null);
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);

  return <>
    <Table.ScrollArea margin={'1.5em'}
                      flex={1}>
      <Table.Root variant={'outline'}
                  size={'lg'}
                  rounded={'md'}
                  stickyHeader>
        <Table.Header bg={'bg.emphasized'}>
          <Table.Row fontWeight={'bold'}>
            <Table.Cell>Workspace</Table.Cell>
            <Table.Cell>State</Table.Cell>
            <Table.Cell>Operations</Table.Cell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <For each={workspaces}>
            {workspace => (
              <Table.Row key={workspace.id}>
                <Table.Cell>{workspace.name}</Table.Cell>
                <Table.Cell>
                  {
                    workspace.isActive
                      ? <Badge colorPalette={'green'}>Active</Badge>
                      : <Badge colorPalette={'red'}>Inactive</Badge>
                  }
                </Table.Cell>
                <Table.Cell>
                  <HStack gap={'0.5em'} direction={'row'}>
                    {
                      workspace.isActive
                        ? <></>
                        : <IconButton onClick={() => setActiveWorkspace.mutate(workspace.id)}
                                      aria-label={'Activate workspace'}
                                      loading={setActiveWorkspace.isPending}
                                      rounded={'full'}
                                      variant={'surface'}
                                      size={'sm'}>
                            <FaToggleOn />
                          </IconButton>
                    }

                    <IconButton onClick={() => {
                                  setWorkspaceToEdit(workspace);
                                  setDrawerIsOpen(true);
                                }}
                                rounded={'full'}
                                variant={'surface'}
                                size={'sm'}>
                      <MdModeEdit />
                    </IconButton>

                    {
                      !workspace.isActive
                        ? <RemoveWorkspace workspace={workspace}/>
                        : <></>
                    }
                  </HStack>
                </Table.Cell>
              </Table.Row>
            )}
          </For>
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
    <IconButton onClick={() => {
                  setWorkspaceToEdit(null);
                  setDrawerIsOpen(true);
                }}
                size={'xl'}
                variant={'surface'}
                position={'absolute'}
                bottom={'1em'}
                right={'1em'}
                rounded={'full'}>
      <MdAdd />
    </IconButton>
    <WorkspaceDrawer key={workspaceToEdit?.id ?? 'NewWorkspace'}
                     workspace={workspaceToEdit}
                     open={drawerIsOpen}
                     setOpen={setDrawerIsOpen}/>
  </>;
};