import classes from './Activities.module.scss';

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Input,
  RadioGroup, Select, SelectItem, Textarea,
  useDisclosure
} from '@heroui/react';
import {HexToInt, IntToHex} from '../../Common/Transformer.ts';
import {useEffect, useState} from 'react';
import ActivityRadio from './ActivityRadio/ActivityRadio.tsx';
import {IWorkspaceDto} from '../../Network/Intents/Workspace/IWorkspaceDto.ts';
import {SharedSelection} from '@heroui/system';
import Activity from '../Activity/Activity.tsx';
import {IActivityDto} from '../../Network/Intents/Activities/IActivityDto.ts';
import Loading from '../Loading/Loading.tsx';
import {useActivity} from '../../Providers/ActivityProvider.tsx';
import {useWorkspace} from '../../Providers/WorkspaceProvider.tsx';

// region Component

/**
 * Represents the Activities component responsible for managing and displaying activities
 * within a workspace. This component handles the following functionalities:
 *
 * - Fetching and displaying a list of workspaces.
 * - Allowing users to select a workspace and viewing its associated activities.
 * - Creating, updating, and editing activities within the selected workspace.
 * - Managing state for loading indicators, selected workspace, and activity details.
 *
 * State:
 * - `isOpen` (boolean): Tracks the state of the modal drawer, indicating if it's open or closed.
 * - `newActivity` (boolean): Tracks whether a new activity is being created.
 * - `name` (string): The name of the activity being added or edited.
 * - `description` (string): The description of the activity being added or edited.
 * - `color` (string|null): The color of the activity in hex format.
 * - `isLoading` (boolean): Indicates whether an API request related to activity management is in progress.
 * - `workspaces` (IWorkspace[]): List of available workspaces.
 * - `workspacesLoading` (boolean): Indicates whether workspaces data is being loaded.
 * - `selectedWorkspace` (IWorkspace|null): Represents the currently selected workspace.
 * - `activities` (IActivityDto[]): List of activities related to the selected workspace.
 * - `activitiesLoading` (boolean): Indicates whether activities data is being loaded.
 *
 * Constants:
 * - `colors` (string[]): List of predefined hex color values available for selection.
 *
 * Hooks:
 * - `useEffect`: Used to fetch workspaces on initial render and load activities when the selected workspace changes.
 * - `useDisclosure`: Handles the opening and closing of the activity modal drawer.
 * - `useApi`: Provides the `sendRequestAsync` method for API calls.
 *
 * Methods:
 * - `loadActivities`: Fetches and updates the activities for the currently selected workspace.
 * - `handleSelectionChange`: Responds to workspace selection change events.
 * - `openNew`: Opens the modal drawer for creating a new activity.
 * - `openEdit`: Prepares and opens the modal drawer for editing an existing activity.
 * - `addActivity`: Adds a new activity by sending a POST request.
 * - `updateActivity`: Updates an existing activity by sending a PUT request.
 */
const Activities = () => {

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { loadActivities, addActivity, updateActivity } = useActivity();
  const { workspaces, loadWorkspaces} = useWorkspace();

  const [newActivity, setNewActivity] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [color, setColor] = useState<string|null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const [workspacesLoading, setWorkspacesLoading] = useState<boolean>(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<IWorkspaceDto|null>(null);

  const [activities, setActivities] = useState<IActivityDto[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState<boolean>(false);

  const colors: string[] = ['#006FEE', '#7828C8', '#0E793C', '#C20E4D', '#992F7B', '#936316', '#053B48', '#71717A'];

  useEffect(() => {
    (async () => {
      setWorkspacesLoading(true);
      await loadWorkspaces();
      setWorkspacesLoading(false);
    })()
  },[]);

  useEffect(() => {
    setSelectedWorkspace(workspaces.find(w => w.isActive) ?? null);
  }, [workspaces]);

  useEffect(() => {
    loadActivities(selectedWorkspace?.id ?? null, state => setActivitiesLoading(state), a => setActivities(a)).then();
  }, [selectedWorkspace]);

  /**
   * Handles the event triggered when a selection is changed in the select component.
   * Extracts the selected workspace ID from the provided keys, finds the corresponding
   * workspace from the list of available workspaces, and updates the selected workspace state.
   *
   * @param {SharedSelection} keys - A set of keys representing the current selection.
   *                                  It is expected to contain a single key corresponding
   *                                  to a selected workspace.
   */
  const handleSelectionChange = (keys: SharedSelection) => {
    const entries = Array.from(keys);
    if (entries.length == 0) {
      setSelectedWorkspace(null);
      setActivities([])
      return;
    }

    // its kind of ridiculous that we have to do this, but the select component doesn't support selection change events'
    const selectedKey:string = entries[0] as string;

    const workspaceId: string = selectedKey.replace('workspace_', '');
    const workspace: IWorkspaceDto|undefined = workspaces.find(w => w.id.toString() === workspaceId);

    setSelectedWorkspace(workspace ?? null);
  };

  /**
   * Handles the initialization and opening of a new activity.
   */
  const openNew = () => {
    setNewActivity(true);
    setName('');
    setDescription('');
    setColor(null);
    onOpen();
  };

  /**
   * Opens the edit modal for a specified activity and pre-fills its details.
   *
   * @param {IActivityDto} activity - The activity object containing details to populate the edit modal.
   * The structure of `activity` includes:
   *   - name: The name of the activity.
   *   - description: A brief description of the activity.
   *   - activityColor: The color associated with the activity, represented as an integer.
   *
   */
  const openEdit = (activity: IActivityDto) => {
    setNewActivity(false);
    setName(activity.name);
    setDescription(activity.description);
    setColor(IntToHex(activity.activityColor));
    onOpen();
  }

  /**
   * Asynchronously adds a new activity to the system.
   *
   * This function triggers the creation of a new activity by sending a request
   * to the backend with the provided activity details. It handles the lifecycle
   * of the operation including loading states and reloading the activities upon
   * successful creation.
   *
   * Note: The function assumes that `name`, `description`, `color`, `selectedWorkspace`,
   * and other state members or helper functions are accessible in the current scope.
   */
  const addNewActivity = async () => {
    setIsLoading(true);

    await addActivity({id: 0, isActive: false, name, description, activityColor: HexToInt(color as string)}, selectedWorkspace!.id)

    setIsLoading(false);
    await loadActivities(selectedWorkspace?.id ?? null, state => setActivitiesLoading(state), a => setActivities(a));

    onClose();
  };

  /**
   * Asynchronously updates an activity's details by sending a PUT request.
   * The function sets a loading state while the operation is in progress and
   * closes the relevant UI or modal upon completion. If the update operation fails,
   * additional logging can be incorporated for error tracking.
   *
   * This method uses the provided activity name, description, and color to update
   * the activity in the specified workspace.
   *
   * @async
   */
  const updateCurrentActivity = async () => {
    setIsLoading(true);
    await updateActivity({id: 0, isActive: false, name, description, activityColor: HexToInt(color as string)}, selectedWorkspace!.id);
    setIsLoading(false);

    onClose();
  };

  return <>
    <div className={[classes.pageWrapper].join(' ')}>
      <div className={classes.useAllowed}>
        <Select isLoading={workspacesLoading}
                label={'Workspaces'}
                selectionMode={'single'}
                selectedKeys={[`workspace_${selectedWorkspace?.id ?? 0}`]}
                onSelectionChange={handleSelectionChange}
                items={workspaces}>
          {
            item =>
              <SelectItem key={`workspace_${item.id}`}>
                {item.name}
              </SelectItem>
          }
        </Select>
      </div>
      <div className={[classes.activities].join(' ')}>
        {
          activitiesLoading
          ? <Loading label={'Loading Activities ...'} size={'md'}/>
          : activities.map(activity => <Activity key={`activity${activity.id}`}
                                                 onEdit={() => openEdit(activity)}
                                                 activity={activity}
                                                 showDescription={true} />)

        }
      </div>
      <div className={[classes.useAllowe, 'flex', 'self-end'].join(' ')}>
        <Button onPress={openNew} isDisabled={selectedWorkspace == null}>
          Add
        </Button>
      </div>
    </div>

    <Drawer isOpen={isOpen}
            size={'md'}
            onClose={onClose}>
      <DrawerContent>
        {
          () =>
            <>
              <DrawerHeader>{newActivity ? 'New Activity' : 'Edit Activity'}</DrawerHeader>
              <DrawerBody>
                <Input label={'Name'}
                       value={name}
                       onChange={(e) => setName(e.target.value)}/>
                <Textarea label={'Description'}
                          value={description ?? ''}
                          onChange={(e) => setDescription(e.target.value)}/>
                <RadioGroup label={'Color'}
                            value={color}
                            classNames={{'wrapper': 'flex-row flex-wrap'}}
                            onValueChange={setColor}>
                  {
                    colors.map(c => <ActivityRadio key={c}
                                                   value={c}>
                      <div className={classes.colorNode}
                           style={{ background: c }}/>
                    </ActivityRadio>)
                  }
                </RadioGroup>
              </DrawerBody>
              <DrawerFooter>
                <Button color="secondary" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary"
                        isLoading={isLoading}
                        onPress={newActivity ? addNewActivity : updateCurrentActivity}
                        isDisabled={name === '' || color === null || color == ''}>
                  {newActivity ? 'Create' : 'Save'}
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

export default Activities;

// endregion