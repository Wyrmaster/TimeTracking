import {BodyIntent} from '../../bodyIntent.ts';
import type {IToken} from './token.ts';
import type {ICredentials} from './credentials.ts';
import {HttpMethod} from '../../httpMethod.ts';
import type {ResponseCallback} from '../../../types/responseCallback.ts';

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