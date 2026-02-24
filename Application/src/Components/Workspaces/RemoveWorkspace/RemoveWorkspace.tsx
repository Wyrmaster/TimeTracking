import {IWorkspaceDto} from '../../../Network/Intents/Workspace/IWorkspaceDto.ts';
import {useWorkspace} from '../../../Providers/WorkspaceProvider.tsx';
import Svg from '../../Svg/Svg.tsx';
import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, useDisclosure} from '@heroui/react';

// region Interface

interface IProps {
  workspace: IWorkspaceDto;
}

// endregion

// region Component

/**
 * A React functional component that provides the functionality to remove a workspace.
 * This component displays a tooltip with a "Remove" option, triggers a modal confirmation dialog,
 * and allows the user to confirm or cancel the deletion of the workspace. Once confirmed,
 * the workspace is removed along with all its associated activities and tracked times.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.workspace - The workspace object to be removed.
 */
const RemoveWorkspace = ({workspace}: IProps) => {

  const { removeWorkspace, } = useWorkspace();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const removeCurrentWorkspace = () => {
    removeWorkspace(workspace.id);
    onClose();
  }

  return <>
    <Tooltip content="Remove">
      <span className={['text-lg', 'text-default-400', 'cursor-pointer', 'active:opacity-50'].join(' ')}
            onClick={onOpen}>
        <Svg viewBox={'0 -960 960 960'}
             path={'M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm148.5-171.5Q440-303 440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280q17 0 28.5-11.5Zm160 0Q600-303 600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280q17 0 28.5-11.5Z'}/>
      </span>
    </Tooltip>
    <Modal
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Remove Workspace</ModalHeader>
            <ModalBody>
              <p>
                You're about to remove the workspace <strong>{workspace.name}</strong>.
                 This will also remove all associated activities and tracked times within this workspace.
                 Are you sure you want to continue?
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger"
                      variant="light"
                      onPress={removeCurrentWorkspace}>
                Delete
              </Button>
              <Button color="primary"
                      onPress={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  </>;
};

// endregion

// region Export

export default RemoveWorkspace;

// endregion