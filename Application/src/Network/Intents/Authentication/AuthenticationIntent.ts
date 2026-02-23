import {BodyIntent} from '../../BodyIntent.ts';
import {IToken} from './IToken.ts';
import {ICredentials} from './ICredentials.ts';
import {HttpMethod} from '../../HttpMethod.ts';
import {ResponseCallback} from '../../../Types/ResponseCallback.ts';

/**
 * Intent used to authenticate a user
 */
export class AuthenticationIntent extends BodyIntent<IToken, ICredentials> {

  // region Constructor

  constructor(username: string, password: string, callback: ResponseCallback<IToken> = null) {
    super({username,password}, '/api/v1/authentication', HttpMethod.POST, callback);
  }

  // endregion

}