import {Intent} from './intent.ts';
import {BodyIntent} from './bodyIntent.ts';
import type {IResponse} from './response.ts';
import {settings} from '../common/settings.ts';

/**
 * class used to communicate with an endpoint
 */
class Api {

  // region Fields

  private readonly _endPoint: string;
  private readonly _unauthorizedCallback: () => void;
  private _token: string|null = null;

  // endregion

  // region Constructor

  constructor(unauthorizedCallback: () => void) {
    this._unauthorizedCallback = unauthorizedCallback;
    this._endPoint = window.location.origin.replace(/\/*$/, '');
    this._token = settings.GetToken();
  }

  // endregion

  // region Methods

  /**
   * Sends a Http Request to the endpoint
   * @param intent describing an a route and its parameter
   * @constructor
   */
  public SendAsync = async <T>(intent: Intent<T>): Promise<IResponse<T>> => {
    const responseDto: IResponse<T> = {code: 0, response: null};

    try {
      const response: Response = await fetch(`${this._endPoint}${intent.GetRoute()}`, {
        method: intent.GetMethod(),
        headers: this._token == null
          ? {
              'Content-Type': 'application/json',
            }
          : {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this._token}`,
            },
        body: (intent as unknown as BodyIntent<never, T>)?.GetBody == undefined
          ? null
          : JSON.stringify((intent as unknown as BodyIntent<never, T>).GetBody()),
      });
      if (response.status == 401) {
        this._unauthorizedCallback();
        responseDto.code = 401;
        return responseDto;
      }
      if (response.status == 402) {
        this._unauthorizedCallback();
        responseDto.code = 402;
        return responseDto;
      }
      responseDto.response = await this.readBodyAsync(response);
      responseDto.code = response.status;
    }
    catch(err) {
      console.error(err);
      responseDto.code = 500
    }

    if (intent.GetCallback() != null)
    {
      (intent.GetCallback() as ((response: IResponse<T>) => void|Promise<void>))(responseDto);
    }

    return responseDto;
  };

  public SetToken = (token: string) => {
    this._token = token;
    settings.SetToken(token);
  }

  // endregion

  // region Private Methods

  /**
   * Reads and deserializes the body of a response, if it has one
   * @param response the response returned by fetch
   */
  private readBodyAsync = async <T>(response: Response): Promise<T|null> => {

    // 204 No Content, 205 Reset Content and 304 Not Modified never carry a body
    if (response.status == 204 || response.status == 205 || response.status == 304) return null;
    if (response.body == null || response.headers.get('Content-Length') == '0') return null;

    const text: string = await response.text();
    return text.length == 0 ? null : JSON.parse(text) as T;
  };

  // endregion
}

const apiFactory = (unauthorizedCallback: () => void): Api => new Api(unauthorizedCallback);

export {
  apiFactory,
  type Api
}
