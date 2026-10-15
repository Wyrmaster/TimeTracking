import {useEffect, useState} from 'react';
import {useActivity} from '../../providers/activityProvider.tsx';
import {Flex, For, IconButton, VStack} from '@chakra-ui/react';
import {Activity} from '../../components/activity.tsx';
import {useWorkspace} from '../../providers/workspaceProvider.tsx';
import type {IWorkspaceDto} from '../../network/intents/workspace/workspaceDto.ts';
import type {IActivityDto} from '../../network/intents/activities/activityDto.ts';
import {WorkspaceSelect} from '../../components/workspaceSelect.tsx';
import {ActivityDrawer} from '../../components/activityDrawer.tsx';
import {MdAdd} from 'react-icons/md';

const Activities = () => {

  const { workspaces } = useWorkspace();
  const { loadActivities } = useActivity();

  const findActive = (workspaces: IWorkspaceDto[]) =>
    workspaces.find(entry => entry.isActive) ?? null

  const [activities, setActivities] = useState<IActivityDto[]>([]);
  const [prevWorkspaces, setPrevWorkspaces] = useState<IWorkspaceDto[]>(workspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState<IWorkspaceDto|null>(findActive(workspaces));

  const [activityToEdit, setActivityToEdit] = useState<IActivityDto|null>(null);

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    loadActivities(selectedWorkspace?.id ?? null).then(setActivities);
  }, [selectedWorkspace]);

  if (workspaces !== prevWorkspaces) {
    setPrevWorkspaces(workspaces);
    setSelectedWorkspace(findActive(workspaces));
  }

  return <>
    <VStack flexGrow={'1'}>
      <WorkspaceSelect workspaces={workspaces} onChange={setSelectedWorkspace}/>
      <Flex flexWrap={'wrap'}
            overflowX={'hidden'}
            overflowY={'auto'}
            alignItems={'start'}
            position={'relative'}
            alignSelf={'flex-start'}>
        <For each={activities}>
          {activity => <Activity key={activity.id}
                                 canTrack={selectedWorkspace?.isActive ?? false}
                                 activity={activity}
                                 edit={a => {
                                   setActivityToEdit(a);
                                   setDrawerOpen(true);
                                 }} />}
        </For>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
        <Flex flexGrow={'1'}/>
      </Flex>
      <ActivityDrawer key={activityToEdit?.id ?? 'NewActivity'}
                      open={drawerOpen}
                      setOpen={setDrawerOpen}
                      activity={activityToEdit}
                      workspaceId={selectedWorkspace!.id}/>
      <IconButton onClick={() => {
                    setActivityToEdit(null);
                    setDrawerOpen(true);
                  }}
                  size={'xl'}
                  variant={'surface'}
                  position={'absolute'}
                  bottom={'1em'}
                  right={'1em'}
                  rounded={'full'}>
        <MdAdd />
      </IconButton>
    </VStack>
  </>;
};

export default Activities;