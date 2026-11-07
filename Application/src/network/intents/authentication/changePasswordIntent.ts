import {BodyIntent} from '../../bodyIntent.ts';
import type {IChangePasswordDto} from './changePasswordDto.ts';
import {HttpMethod} from '../../httpMethod.ts';

/**
 * Intent used to change the password of the authenticated user
 */
export class ChangePasswordIntent extends BodyIntent<void, IChangePasswordDto> {

  // region Constructor

  constructor(changePassword: IChangePasswordDto) {
    super(changePassword, '/api/v1/authentication/password/', HttpMethod.PUT);
  }

  // endregion

}
