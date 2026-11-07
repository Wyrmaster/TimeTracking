import {useMutation} from '@tanstack/react-query';
import {useApi} from '../providers/apiContext.ts';
import type {IChangePasswordDto} from '../network/intents/authentication/changePasswordDto.ts';
import {ChangePasswordIntent} from '../network/intents/authentication/changePasswordIntent.ts';

/**
 * Changes the password of the authenticated user
 */
export const useChangePassword = () => {
  const {requestAsync} = useApi();

  return useMutation({
    mutationFn: (changePassword: IChangePasswordDto) => requestAsync(new ChangePasswordIntent(changePassword)),
    meta: {
      successMessage: 'Changed the password...',
      errorMessage: 'Failed to change the password, check the current password...',
    },
  });
};
