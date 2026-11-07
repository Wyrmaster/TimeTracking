const identifier: string = 'TimeTracker';
const tokenIdentifier: string = `${identifier}_Token`;
const firstDayOfTheWeekIdentifier: string = `${identifier}_FirstDayOfTheWeek`;
const useWorkWeekIdentifier: string = `${identifier}_UseWorkWeek`;

/**
 * Settings of the current user, persisted in the local storage
 */
const settings = {

  /**
   * Token used to authenticate requests
   */
  getToken: (): string|null => localStorage.getItem(tokenIdentifier),

  /**
   * Sets the token used to authenticate requests, an empty token removes it
   * @param token new token to set
   */
  setToken: (token: string): void => {
    if (token == '') {
      localStorage.removeItem(tokenIdentifier);
    }
    else {
      localStorage.setItem(tokenIdentifier, token);
    }
  },

  /**
   * Gets the first day of the week for the current user (0 = Sunday, 1 = Monday, ...)
   */
  getFirstDayOfTheWeek: (): number => parseInt(localStorage.getItem(firstDayOfTheWeekIdentifier) ?? '0'),

  /**
   * Sets the first day of the week for the current user
   * @param day index of the first day of the week (0 = Sunday, 1 = Monday, ...)
   */
  setFirstDayOfTheWeek: (day: number): void => localStorage.setItem(firstDayOfTheWeekIdentifier, day.toString()),

  /**
   * Gets whether the current user wants to use the work week or not
   */
  getUseWorkWeek: (): boolean => localStorage.getItem(useWorkWeekIdentifier)?.toUpperCase() === 'TRUE',

  /**
   * Sets whether the current user wants to use the work week or not
   * @param useWorkWeek whether to use the work week or not
   */
  setUseWorkWeek: (useWorkWeek: boolean): void => localStorage.setItem(useWorkWeekIdentifier, useWorkWeek.toString()),

};

export {settings};
