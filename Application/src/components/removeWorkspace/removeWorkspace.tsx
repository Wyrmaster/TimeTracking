import {IconButton, Dialog, Portal, Button, CloseButton} from '@chakra-ui/react';
import {MdDelete} from 'react-icons/md';
import type {IWorkspaceDto} from '../../network/intents/workspace/workspaceDto.ts';
import {useWorkspace} from '../../providers/workspaceProvider.tsx';

interface IProps {
  workspace: IWorkspaceDto;
}

export const RemoveWorkspace = ({workspace}: IProps) => {

  const {removeWorkspace} = useWorkspace();

  return <>
    <Dialog.Root size={'md'}>
      <Dialog.Trigger>
        <IconButton rounded="full"
                    variant={'surface'}
                    size={'sm'}>
          <MdDelete />
        </IconButton>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Remove Workspace</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <p>
                You're about to remove the workspace <strong>{workspace.name}</strong>.
                This will also remove all associated activities and tracked times within this workspace.
                Are you sure you want to continue?
              </p>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant={'outline'}>Cancel</Button>
              </Dialog.ActionTrigger>
              <Button variant={'outline'}
                      onClick={() => removeWorkspace(workspace.id)}>
                OK
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>

  </>;
};