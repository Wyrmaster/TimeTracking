/**
 * Error thrown when the api answers a request with an unexpected status code
 */
export class ApiError extends Error {

  // region Fields

  /**
   * status code of the response, 0 if the api could not be reached
   */
  public readonly status: number;

  // endregion

  // region Constructor

  constructor(status: number, route: string) {
    super(`Request to ${route} failed with status ${status}`);
    this.status = status;
  }

  // endregion

}
