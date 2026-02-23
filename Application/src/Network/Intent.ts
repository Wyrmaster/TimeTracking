import {HttpMethod} from './HttpMethod.ts';
import {ResponseCallback} from '../Types/ResponseCallback.ts';

/**
 * Base Intent used for communication
 */
export abstract class Intent<T> {

  // region Fields

  private readonly _route: string;
  private readonly _method: HttpMethod;
  private readonly _callback: ResponseCallback<T>;

  // endregion

  // region Constructor

  /**
   * setups the intent
   * @param route target of the http request
   * @param method http method used for the http request
   * @param callback response method used when the http request finished
   * @protected
   */
  protected constructor(route: string, method: HttpMethod, callback: ResponseCallback<T> = null) {
    this._route = route;
    this._method = method;
    this._callback = callback;
  }

  // endregion

  // region Methods

  /**
   * the assigned route
   */
  public GetRoute = (): string => this._route;

  /**
   * the assigned http method
   */
  public GetMethod = (): HttpMethod => this._method;

  /**
   * the callback to be executed when the response had finished
   */
  public GetCallback = (): ResponseCallback<T> => this._callback;

  // endregion

}