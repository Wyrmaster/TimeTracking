import classes from './DayRows.module.scss';
import {DateValue} from '@internationalized/date';
import {useState} from 'react';
import {ElementMetric} from '../../../Hooks/useElementMetrics.tsx';
import Cell from './Cell/Cell.tsx';
import CellActivity from '../CellActivity/CellActivity.tsx';
import {useActivity} from '../../../../Providers/ActivityProvider.tsx';

// region Interface

interface IProps {
  dates: DateValue[];
}

// endregion

// region Component

/**
 * Component representing rows of a time-tracking table, where each row corresponds to an hour
 * and each column corresponds to a date provided in the `dates` property.
 *
 * @param {IProps} props - The input properties for the component.
 * @param {DateValue[]} props.dates - An array of date objects representing the columns in the table.
 *
 * @returns {JSX.Element} A rendered table-like component displaying hourly rows and their
 * corresponding cells based on the provided dates and time entries.
 *
 * This component:
 * - Dynamically generates rows for each hour of the day (24 rows in total).
 * - Displays cells for each day (column) within each hour, based on the provided `dates`.
 * - Tracks metrics for the cells to handle layout-related computation.
 * - Renders existing time entries or activities visually distributed among the cells.
 * - Highlights the currently active (new) time entry, if present.
 */
const DayRows = ({dates}: IProps) => {

  const [metrics, setMetrics] = useState<ElementMetric[]>(new Array(dates.length).fill(null));
  const { timeEntries, newTimeEntry } = useActivity();

  const compareDate = (x: DateValue, y: Date) =>
    x.year === y.getFullYear() && x.month === y.getMonth() + 1 && x.day === y.getDate()
  ;

  return <>
    {
      Array.from({length: 24}, (_, hour) =>
        <div key={hour}
             className={[classes.tableRow].join(' ')}>
          <div className={[classes.cell].join(' ')}>
            <span>{hour.toString().padStart(2, '0')}:00</span>
          </div>
          {
            dates.map((d, colIndex) => <Cell key={`${d.toString()}${hour}${colIndex}`}
                                             relayMetrics={metric => hour == 0 ? setMetrics(old => [...old.slice(0, colIndex), metric, ...old.slice(colIndex + 1)]) : null}
                                             hour={hour}
                                             date={new Date(d.year, d.month-1, d.day)}
                                             column={colIndex}/>)
          }
        </div>)
    }
    {
      timeEntries.map((timeEntry, i) => {
        const startDate: Date = new Date(timeEntry.start);

        const diff = (timeEntry.end ? new Date(timeEntry.end) : new Date()).getTime() - new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
        return new Array(Math.ceil(diff / 1000 / 60 / 60 / 24))
          .fill(0)
          .map((_, subI) => subI)
          .filter(subI => {
            const localStartDate: Date = new Date(startDate.getTime());
            const date = new Date(localStartDate.setDate(localStartDate.getDate() + subI))
            return  dates.findIndex(d => compareDate(d, date)) != -1;
          })
          .map(subI => {
            const localStartDate: Date = new Date(startDate.getTime());
            const date = new Date(localStartDate.setDate(localStartDate.getDate() + subI))
            const index = dates.findIndex(d => compareDate(d, date));

            return (<CellActivity key={`trackingCell${i.toString().padStart(3,'0')}${subI.toString().padStart(3,'0')}`}
                                  date={date}
                                  elementMetric={metrics[index]}
                                  timeEntry={timeEntry}/>);
          });
      })
    }
    {
      newTimeEntry != null
        ? <CellActivity date={new Date(newTimeEntry.start)}
                        elementMetric={metrics[dates.findIndex(d => compareDate(d, new Date(newTimeEntry.start)))]}
                        timeEntry={newTimeEntry}
                        newEntry={true}/>
        : <></>
    }
  </>;
};

// endregion

// region Export

export default DayRows;

// endregion