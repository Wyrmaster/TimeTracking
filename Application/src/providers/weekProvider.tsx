import {useMemo, useState} from 'react';
import {type DateValue, getLocalTimeZone, today} from '@internationalized/date';
import type {IChildren} from '../interfaces/children.ts';
import {settings} from '../common/settings.ts';
import {generateWeekDays} from '../common/week.ts';
import {WeekContext} from './weekContext.ts';

/**
 * Keeps track of the week shown in the overview.
 *
 * @param children The components showing the week.
 */
export const WeekProvider = ({children}: IChildren) => {

  const [date, setDate] = useState<DateValue>(() => today(getLocalTimeZone()));
  const [useWorkWeek, setUseWorkWeek] = useState<boolean>(settings.getUseWorkWeek);

  const weekDays: DateValue[] = useMemo(
    () => generateWeekDays(date, useWorkWeek, settings.getFirstDayOfTheWeek()),
    [date, useWorkWeek],
  );

  const changeUseWorkWeek = (value: boolean) => {
    settings.setUseWorkWeek(value);
    setUseWorkWeek(value);
  };

  return <>
    <WeekContext.Provider value={{
      date,
      setDate,
      useWorkWeek,
      setUseWorkWeek: changeUseWorkWeek,
      weekDays,
    }}>
      {children}
    </WeekContext.Provider>
  </>;
};
