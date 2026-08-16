import {useState} from 'react';
import classes from './workspaceDrawer.module.scss';
import type {IWorkspaceDto} from '../../network/intents/workspace/workspaceDto.ts';
import {Drawer, Field, Input, Textarea, VStack} from '@chakra-ui/react';
import * as React from 'react';

interface IProps {
  workspace: IWorkspaceDto;
  edit?: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const WorkspaceDrawer = (
  {
    open,
    setOpen,
    edit = false
  }: IProps) => {

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  return <>
    <Drawer.Root open={open} onOpenChange={e => setOpen(e.open)}>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Title>{!edit ? 'New Workspace' : 'Edit Workspace'}</Drawer.Title>
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
          <Drawer.Footer></Drawer.Footer>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  </>;
};