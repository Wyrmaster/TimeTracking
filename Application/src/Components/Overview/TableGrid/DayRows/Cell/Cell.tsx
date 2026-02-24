import classes from './Cell.module.scss';
import {ElementMetric, useElementMetrics} from '../../../../Hooks/useElementMetrics.tsx';
import { useEffect } from 'react';
import { useGrid } from '../../../../../Providers/GridProvider.tsx';
import { useActivity } from '../../../../../Providers/ActivityProvider.tsx';

// region Interface

interface IProps {
  column: number;
  hour: number;
  date: Date;
  relayMetrics: ((metrics: ElementMetric) => void) | null;
}

// endregion

// region Component

/**
 * Cell component represents a single time block in a grid layout, allowing interaction and providing
 * functionality to create temporary time entries. It dynamically adjusts its height based on grid
 * configuration and invokes provided metrics relay functions.
 *
 * @param {object} props - Properties passed to the component.
 * @param {number} props.column - The column index this cell belongs to in the grid.
 * @param {function|null} props.relayMetrics - Callback function to relay element metrics. Can be null.
 * @param {number} props.hour - The hour associated with this specific grid cell.
 * @param {Date} props.date - The date object representing the current day's context.
 *
 * @returns {JSX.Element} A rendered cell component with interactive sub-divisions.
 */
const Cell = ({ column, relayMetrics, hour, date }: IProps) => {

  const { ref, metrics } = useElementMetrics([column, hour, relayMetrics == null]);
  const { setNewTimeEntry } = useActivity();

  const { cellHeight } = useGrid();

  useEffect(() => {
    if (metrics == null) {
      return;
    }

    if (relayMetrics){
      relayMetrics(metrics);
    }
  }, [metrics]);

  /**
   * Creates a temporary new time entry with the given index.
   * @param {number} index - The index of the sub-division within the hour.
   */
  const createTemporaryNewEntry = async (index: number) => {
    setNewTimeEntry({
      activity: null,
      id: 0,
      start: new Date
      (
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        index * 15,
        0,
        0
      ),
      end: new Date
      (
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        index * 15 + 15,
        0,
        0
      ),
      description: ''
    })
  }

  return <>
    <div ref={ref}
         style={{height: `${cellHeight}px`}}
         className={[classes.cell, classes.content,hour < 9 || hour > 17 ? classes.outside : ''].join(' ')}>
      <div className={classes.cell}
           onClick={() => createTemporaryNewEntry(0)}/>
      <div className={classes.cell}
           onClick={() => createTemporaryNewEntry(1)}/>
      <div className={classes.cell}
           onClick={() => createTemporaryNewEntry(2)}/>
      <div className={classes.cell}
           onClick={() => createTemporaryNewEntry(3)}/>
    </div>
  </>;
};

// endregion

// region Export

export default Cell;

// endregion