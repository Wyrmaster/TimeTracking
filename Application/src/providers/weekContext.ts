import {createContext, useContext} from 'react';
import type {DateValue} from '@internationalized/date';

// region Interface

export interface IWeekContext {
  /**
   * The selected day, the shown week is the one containing it
   */
  date: DateValue;
  setDate: (date: DateValue) => void;

  /**
   * Whether only monday to friday are shown
   */
  useWorkWeek: boolean;
  setUseWorkWeek: (useWorkWeek: boolean) => void;

  /**
   * The days of the shown week
   */
  weekDays: DateValue[];
}

// endregion

// region Context

export const WeekContext = createContext<IWeekContext|null>(null);

/**
 * Gives access to the week shown in the overview, must be used within the `WeekProvider`
 */
export const useWeek = (): IWeekContext => {
  const context: IWeekContext|null = useContext(WeekContext);

  if (context == null) {
    throw new Error('useWeek must be used within the WeekProvider');
  }

  return context;
};

// endregion
