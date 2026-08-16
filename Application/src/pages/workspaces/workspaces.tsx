import {useEffect} from 'react';
import classes from './workspaces.module.scss';
import {useWorkspace} from '../../providers/workspaceProvider.tsx';
import {Badge, For, HStack, IconButton, Table} from '@chakra-ui/react';
import {FaToggleOn} from 'react-icons/fa6';
import {MdAdd, MdModeEdit} from 'react-icons/md';
import {RemoveWorkspace} from '../../components/removeWorkspace/removeWorkspace.tsx';

export const Workspaces = () => {
  const {workspaces} = useWorkspace();

  return <>
    <Table.ScrollArea margin={'1.5em'}
                      flex={1}>
      <Table.Root variant="outline"
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
                        : <IconButton rounded="full"
                                      variant={'surface'}
                                      size={'sm'}>
                          <FaToggleOn />
                        </IconButton>
                    }

                    <IconButton rounded="full"
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
    <IconButton size={'xl'}
                variant={'surface'}
                position={'absolute'}
                bottom={'1em'}
                right={'1em'}
                rounded={'full'}>
      <MdAdd />
    </IconButton>
  </>;
};