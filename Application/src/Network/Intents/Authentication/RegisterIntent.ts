import {BodyIntent} from '../../BodyIntent.ts';
import {IToken} from './IToken.ts';
import {ICredentials} from './ICredentials.ts';
import {HttpMethod} from '../../HttpMethod.ts';

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