import {useState} from 'react';
import {Grid, IconButton, VStack} from '@chakra-ui/react';
import {MdAdd} from 'react-icons/md';
import {Activity} from '../../components/activity.tsx';
import {WorkspaceSelect} from '../../components/workspaceSelect.tsx';
import {ActivityDrawer} from '../../components/activityDrawer.tsx';
import type {IWorkspaceDto} from '../../network/intents/workspace/workspaceDto.ts';
import type {IActivityDto} from '../../network/intents/activities/activityDto.ts';
import {useWorkspaces} from '../../queries/workspaces.ts';
import {useActivities} from '../../queries/activities.ts';

/**
 * Stable placeholders while loading, the workspace select resets itself whenever it receives a new array
 */
const NO_WORKSPACES: IWorkspaceDto[] = [];
const NO_ACTIVITIES: IActivityDto[] = [];

/**
 * Page listing the activities of a workspace, activities of the active workspace can be tracked.
 */
export const Activities = () => {

  const {data: workspaces = NO_WORKSPACES} = useWorkspaces();

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number|null>(null);
  const [activityToEdit, setActivityToEdit] = useState<IActivityDto|null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // until a workspace is picked the active one is shown
  const selectedWorkspace: IWorkspaceDto|null =
    workspaces.find(workspace => workspace.id == selectedWorkspaceId)
    ?? workspaces.find(workspace => workspace.isActive)
    ?? null;

  const {data: activities = NO_ACTIVITIES} = useActivities(selectedWorkspace?.id ?? null);

  /**
   * Opens the drawer to edit an activity, or to create a new one
   * @param activity The activity to edit, null to create a new one.
   */
  const openDrawer = (activity: IActivityDto|null) => {
    setActivityToEdit(activity);
    setDrawerOpen(true);
  };

  return <>
    <VStack flexGrow={'1'}
            alignItems={'stretch'}
            overflowY={'auto'}>
      <WorkspaceSelect workspaces={workspaces}
                       onChange={workspace => setSelectedWorkspaceId(workspace.id)}/>
      <Grid templateColumns={'repeat(auto-fill, minmax(16rem, 1fr))'}
            alignItems={'start'}>
        {activities.map(activity => (
          <Activity key={activity.id}
                    canTrack={selectedWorkspace?.isActive ?? false}
                    activity={activity}
                    edit={openDrawer}/>
        ))}
      </Grid>
      {
        selectedWorkspace == null
          ? <></>
          : <ActivityDrawer key={activityToEdit?.id ?? 'NewActivity'}
                            open={drawerOpen}
                            setOpen={setDrawerOpen}
                            activity={activityToEdit}
                            workspaceId={selectedWorkspace.id}/>
      }
      <IconButton onClick={() => openDrawer(null)}
                  aria-label={'Add activity'}
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
