const identifier: string  = 'TimeTracker';
const tokenIdentifier: string = `${identifier}_Token`;
const firstDayOfTheWeekIdentifier: string = `${identifier}_FirstDayOfTheWeek`;
const useWorkWeekIdentifier: string = `${identifier}_UseWorkWeek`;
const themeIdentifier: string = `${identifier}_Theme`;

const darkModeMql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

/**
 * Class describing the settings for the current application
 */
class Settings {

  // region Properties

  /**
   * Token used to authenticate requests
   */
  public GetToken = (): string|null => localStorage.getItem(tokenIdentifier) ?? null;

  /**
   * Sets the token for the current solution
   * @param token new token to set
   */
  public SetToken = (token: string): void => localStorage.setItem(tokenIdentifier, token);

  /**
   * Gets the first day of the week for the current user
   */
  public GetFirstDayOfTheWeek = (): number => parseInt(localStorage.getItem(firstDayOfTheWeekIdentifier) ?? '0');

  /**
   * Sets the first day of the week for the current user
   * @param day index of the first day of the week (0 = Sunday, 1 = Monday, ...)
   */
  public SetFirstDayOfTheWeek = (day: number): void => localStorage.setItem(firstDayOfTheWeekIdentifier, day.toString());

  /**
   * Gets whether the current user wants to use the work week or not
   */
  public GetUseWorkWeek = (): boolean => localStorage.getItem(useWorkWeekIdentifier)?.toUpperCase() === 'TRUE';

  /**
   * Sets whether the current user wants to use the work week or not
   * @param useWorkWeek whether to use the work week or not
   */
  public SetUseWorkWeek = (useWorkWeek: boolean): void => localStorage.setItem(useWorkWeekIdentifier, useWorkWeek.toString());


  public GetTheme = (): string =>
    localStorage.getItem(themeIdentifier)
      ?? (darkModeMql && darkModeMql.matches ? 'dark' : 'light');

  public SetTheme = (theme: string): void => localStorage.setItem(themeIdentifier, theme);

  // endregion

}

const settings = new Settings();

export { settings };