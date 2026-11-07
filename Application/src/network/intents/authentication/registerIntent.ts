import {BodyIntent} from '../../bodyIntent.ts';
import type {IToken} from './token.ts';
import type {ICredentials} from './credentials.ts';
import {HttpMethod} from '../../httpMethod.ts';

/**
 * Intent used to register a new user
 */
export class RegisterIntent extends BodyIntent<IToken, ICredentials> {

  // region Constructor

  constructor(credentials: ICredentials) {
    super(credentials, `/api/v1/authentication/register`, HttpMethod.POST);
  }

  // endregion

}