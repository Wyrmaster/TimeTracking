import {BodyIntent} from '../../bodyIntent.ts';
import type {IToken} from './token.ts';
import type {ICredentials} from './credentials.ts';
import {HttpMethod} from '../../httpMethod.ts';

/**
 * Intent used to authenticate a user
 */
export class AuthenticationIntent extends BodyIntent<IToken, ICredentials> {

  // region Constructor

  constructor(username: string, password: string) {
    super({username,password}, '/api/v1/authentication', HttpMethod.POST);
  }

  // endregion

}