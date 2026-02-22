import * as React from 'react';
import classes from './Workspaces.module.scss';
import {
  Button,
  Chip,
  Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow, Textarea,
  Tooltip, useDisclosure
} from '@heroui/react';
import {useWorkspace} from '../../Providers/WorkspaceProvider.tsx';
import {IWorkspaceDto} from '../../Network/Intents/Workspace/IWorkspaceDto.ts';
import Svg from '../Svg/Svg.tsx';
import {Key, useState} from 'react';
import RemoveWorkspace from './RemoveWorkspace/RemoveWorkspace.tsx';

// region Interface

interface IProps {

}

// endregion

// region Component

const Workspaces = ({}: IProps) => {

  const { workspaces, addWorkspace, updateWorkspace, setActiveWorkspace } = useWorkspace();

  const [ newWorkspace, setNewWorkspace ] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [workspaceId, setWorkspaceId] = useState<number>(0);
  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [workspaceDescription, setWorkspaceDescription] = useState<string>('');

  const columns = [
    {name: 'NAME', uid: 'name'},
    {name: 'DESCRIPTION', uid: 'description'},
    {name: 'STATUS', uid: 'status'},
    {name: 'ACTIONS', uid: 'actions'},
  ];

  const editWorkspace = (workspace: IWorkspaceDto) => {
    setNewWorkspace(false);
    setWorkspaceId(workspace.id);
    setWorkspaceName(workspace.name);
    setWorkspaceDescription(workspace.description);
    onOpen();
  };

  const openAddWorkspace = () => {
    setNewWorkspace(true);
    setWorkspaceName('');
    setWorkspaceDescription('');
    onOpen();
  };

  const saveNewWorkspace = () => {
    addWorkspace({id: 0, isActive: false, name: workspaceName, description: workspaceDescription});
    onClose();
  };

  const updateCurrentWorkspace = () => {
    updateWorkspace({id: workspaceId, isActive: false, name: workspaceName, description: workspaceDescription});
    onClose();
  };

  const renderCell = React.useCallback((workspace: IWorkspaceDto, columnKey: Key) => {

    switch (columnKey) {
      case 'name':
        return (workspace.name);
      case 'description':
        return (workspace.description);
      case 'status':
        return <>
          <Chip className="capitalize"
                color={workspace.isActive ? 'success' : 'danger'}
                size="sm"
                variant="flat">
            {workspace.isActive ? 'Active' : 'Inactive'}
          </Chip>
        </>;
      case "actions":
        return <>
          <div className={['relative', 'flex', 'items-center', 'gap-2', classes.icons].join(' ')}>
            {
              workspace.isActive
                ? <></>
                : <Tooltip content={'Set Active'}>
                    <span className={['text-lg', 'text-default-400', 'cursor-pointer', 'active:opacity-50'].join(' ')}
                          onClick={() => setActiveWorkspace(workspace.id)}>
                      <Svg viewBox={'0 -960 960 960'}
                           path={'M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm485-155q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Z'}/>
                    </span>
                  </Tooltip>
            }
            <Tooltip content="Edit">
              <span className={['text-lg', 'text-default-400', 'cursor-pointer', 'active:opacity-50'].join(' ')}
                    onClick={() => editWorkspace(workspace)}>
                <Svg viewBox={'0 -960 960 960'}
                     path={'M160-120q-17 0-28.5-11.5T120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97Zm544-528 56-56-56-56-56 56 56 56Z'}/>
              </span>
            </Tooltip>
            {
              workspace.isActive
                ? <></>
                : <RemoveWorkspace workspace={workspace}/>
            }
          </div>
        </>;
      default:
        return '';
    }
  }, []);

  return <>
    <div className={['flex', 'flex-col', 'grow', 'overflow-hidden', 'gap-2', ].join(' ')}>
      <div className={['flex', 'flex-row', classes.controls].join(' ')}>
        <Button color={'primary'}
                onPress={openAddWorkspace}>
          <span>Add</span>
        </Button>
      </div>
      <div className={['flex', 'flex-col', 'grow', 'overflow-hidden',].join(' ')}>
        <Table isHeaderSticky
               classNames={{
                 base: ['overflow-auto'].join(' ')
               }}>
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={workspaces} className={'overflow-auto'}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>

    <Drawer isOpen={isOpen}
            size={'md'}
            onClose={onClose}>
      <DrawerContent>
        {
          () =>
            <>
              <DrawerHeader>{newWorkspace ? 'New Workspace' : 'Edit Workspace'}</DrawerHeader>
              <DrawerBody>
                <Input label={'Name'}
                       value={workspaceName}
                       onChange={(e) => setWorkspaceName(e.target.value)}/>
                <Textarea label={'Description'}
                          value={workspaceDescription}
                          onChange={(e) => setWorkspaceDescription(e.target.value)}/>

              </DrawerBody>
              <DrawerFooter>
                <Button color="secondary" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary"
                        onPress={newWorkspace ? saveNewWorkspace : updateCurrentWorkspace}
                        isDisabled={workspaceName === ''}>
                  {newWorkspace ? 'Create' : 'Save'}
                </Button>
              </DrawerFooter>
            </>
        }
      </DrawerContent>
    </Drawer>
  </>;
};

// endregion

// region Export

export default Workspaces;

// endregion