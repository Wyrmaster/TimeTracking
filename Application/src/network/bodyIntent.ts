import {Intent} from './intent.ts';
import {HttpMethod} from './httpMethod.ts';

/**
 * Intent used for http request with bodies
 */
export abstract class BodyIntent<T, U> extends Intent<T> {

  // region Fields

  private readonly _body: U;

  // endregion

  // region Constructor

  /**
   * setup intents used
   * @param body content of the http request
   * @param route target of the http request
   * @param method http method used for the http request
   * @protected
   */
  protected constructor(body: U, route: string, method: HttpMethod) {
    super(route, method);

    if (method == HttpMethod.GET || method == HttpMethod.DELETE) {
      throw new Error('Get and Delete request cannot have a body');
    }

    this._body = body;
  }

  // endregion

  // region Methods

  /**
   * returns the body of the http request
   */
  public getBody = (): U => this._body;

  // endregion

}
