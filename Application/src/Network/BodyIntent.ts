import {Intent} from './Intent.ts';
import {HttpMethod} from './HttpMethod.ts';
import {ResponseCallback} from '../Types/ResponseCallback.ts';

/**
 * Intent used for http request with bodies
 */
export abstract class BodyIntent<T,U> extends Intent<T> {

  // region Fields

  private readonly _body: U;

  // endregion

  // region Constructor

  /**
   * setup intents used
   * @param body content of the http request
   * @param route target of the http request
   * @param method http method used for the http request
   * @param callback response method used when the http request finished
   * @protected
   */
  protected constructor(body: U, route: string, method: HttpMethod, callback: ResponseCallback<T> = null) {
    super(route, method, callback);
    switch (method) {
      case HttpMethod.GET:
      case HttpMethod.DELETE:
      {
        throw new Error("Get and Delete request cannot have a body");
      }
    }
    this._body = body;
  }

  // endregion

  // region Methods

  /**
   * returns the body of the http request
   */
  public GetBody = (): U => this._body;

  // endregion

}