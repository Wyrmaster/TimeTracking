import {useState} from 'react';
import type {IWorkspaceDto} from '../network/intents/workspace/workspaceDto.ts';
import {Button, Drawer, Field, Input, Textarea, VStack} from '@chakra-ui/react';
import * as React from 'react';
import {useAddWorkspace, useUpdateWorkspace} from '../queries/workspaces.ts';

interface IProps {
  workspace: IWorkspaceDto|null;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const WorkspaceDrawer = (
  {
    workspace,
    open,
    setOpen,
  }: IProps) => {

  const addWorkspace = useAddWorkspace();
  const updateWorkspace = useUpdateWorkspace();

  /**
   * Persists the workspace and closes the drawer once it was saved.
   */
  const save = () => {
    const close = {onSuccess: () => setOpen(false)};

    if (workspace == null) {
      addWorkspace.mutate({name, description} as IWorkspaceDto, close);
    }
    else {
      updateWorkspace.mutate({
        id: workspace.id,
        name,
        description,
      } as IWorkspaceDto, close);
    }
  };

  const [name, setName] = useState<string>(workspace?.name ?? '');
  const [description, setDescription] = useState<string>(workspace?.description ?? '');

  return <>
    <Drawer.Root open={open} onOpenChange={e => setOpen(e.open)}>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Title>{workspace == null ? 'New Workspace' : 'Edit Workspace'}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <VStack>
              <Field.Root>
                <Field.Label>Name</Field.Label>
                <Input defaultValue={name}
                       onChange={e => setName(e.target.value)}/>
              </Field.Root>
              <Field.Root>
                <Field.Label>Description</Field.Label>
                <Textarea defaultValue={description}
                          onChange={e => setDescription(e.target.value)}/>
              </Field.Root>
            </VStack>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant={'outline'}
                    onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={addWorkspace.isPending || updateWorkspace.isPending}
                    onClick={save}>
              Save
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  </>;
};