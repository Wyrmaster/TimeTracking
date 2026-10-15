import {useMemo, useState} from 'react';
import type {IWorkspaceDto} from '../network/intents/workspace/workspaceDto.ts';
import {createListCollection, For, Portal, Select} from '@chakra-ui/react';

interface IProps {
  workspaces: IWorkspaceDto[];
  onChange: (workspace: IWorkspaceDto) => void;
}

export const WorkspaceSelect = (
  {
    workspaces,
    onChange,
  }: IProps) => {

  const collection = useMemo(
    () =>
      createListCollection({
        items: workspaces.map(entry => ({label: entry.name, value: entry.id.toString()})),
      }),
    [workspaces]
  );

  const [prevWorkspaces, setPrevWorkspaces] = useState<IWorkspaceDto[]>(workspaces);

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(workspaces.find(entry => entry.isActive)?.id?.toString() ?? '');

  if (prevWorkspaces != workspaces){
    setPrevWorkspaces(workspaces)
    setSelectedWorkspaceId(workspaces.find(entry => entry.isActive)?.id?.toString() ?? '');
  }

  const localOnChange = (id: string) => {
    const foundWorkspace: IWorkspaceDto|null = workspaces.find(entry => entry.id == parseInt(id)) ?? null;
    if (foundWorkspace) {
      setSelectedWorkspaceId(id)
      onChange(foundWorkspace);
    }
  };

  return <>
    <Select.Root collection={collection}
                 padding={'1.25em'}
                 value={selectedWorkspaceId ? [selectedWorkspaceId] : []}
                 onValueChange={details => localOnChange(details.value[0])}>
      <Select.HiddenSelect />

      <Select.Label>Workspace</Select.Label>

      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Select a workspace" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>

      <Portal>
        <Select.Positioner>
          <Select.Content>
            <For each={collection.items}>
              {
                (item) => (
                  <Select.Item key={item.value}
                               item={item}
                               cursor={'pointer'}>
                    {item.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                )
              }
            </For>
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  </>;
};