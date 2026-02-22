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