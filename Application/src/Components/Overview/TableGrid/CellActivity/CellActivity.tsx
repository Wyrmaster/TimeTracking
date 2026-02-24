import classes from './CellActivity.module.scss';
import {ITimeEntryDto} from '../../../../Network/Intents/TimeEntry/ITimeEntryDto.ts';
import {useEffect, useState} from 'react';
import {HexToInt, IntToHex} from '../../../../Common/Transformer.ts';
import {ElementMetric} from '../../../Hooks/useElementMetrics.tsx';
import {Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import CellActivityEdit from './CellAcitivityEdit/CellActivityEdit.tsx';
import {useGrid} from '../../../../Providers/GridProvider.tsx';
import {useActivity} from '../../../../Providers/ActivityProvider.tsx';

const gap: number = 20;

// region Interface

interface IProps {
  timeEntry: ITimeEntryDto;
  date: Date;
  elementMetric: ElementMetric;
  newEntry?: boolean;
}

// endregion

// region Component

/**
 * Represents a functional React component that renders a visual representation of a calendar or schedule cell
 * associated with a specific time entry. This component provides interactive functionalities like popovers
 * for editing the time entry and dynamically updates based on time entry data or layout changes.
 *
 * @param {ITimeEntryDto} timeEntry - The detailed time entry object that contains activity and time range information.
 * @param {Date} date - The reference date to determine the position and visibility of the activity cell within the calendar.
 * @param {ElementMetric} elementMetric - Contains layout measurement details for rendering the activity cell.
 * @param {boolean} [newEntry=false] - Indicates whether the time entry is a new and unsaved activity.
 *
 * @description
 * The `CellActivity` component calculates dynamic styles such as `top`, `left`, `width`, and `height`
 * based on the time entry, current date, and layout metrics. It also computes the duration of the activity
 * both in numeric and string formats. The component conditionally interacts with a popover UI to allow
 * modifications to time entries. Real-time updates are handled using `useEffect` hooks for responsiveness
 * to prop changes or time-lapse updates. Background color and text data are customized based on the
 * provided activity metadata.
 */
const CellActivity = ({ timeEntry, date, elementMetric, newEntry = false }: IProps) => {

  /**
   * Calculates the top position of the activity cell based on the provided time entry and layout metrics.
   */
  const calculateTop = () : number => {
    const hourSize: number = cellHeight + 1;
    const startDate: Date = new Date(timeEntry.start);

    if (startDate.compare(date)){
      return elementMetric?.headerSize +  hourSize * (startDate.getHours() + startDate.getMinutes() / 60.0);
    }

    return elementMetric?.headerSize ?? 0;
  }

  /**
   * Calculates the height of the activity cell based on the provided time entry and layout metrics.
   */
  const calculateHeight = () : number => {
    const hourSize: number =  cellHeight + 1;
    const endDate: Date = new Date(timeEntry.end ?? new Date().getTime());
    const startDate: Date = new Date(timeEntry.start);

    if (endDate.compare(date)) {
      const duration: number = endDate.getTime() - startDate.getTime();
      const hours: number = Math.floor(duration / (1000 * 60 * 60));
      const minutes: number = Math.floor(duration / (1000 * 60) % 60);
      const seconds: number = Math.floor(duration / 1000 % 60);

      return hourSize * hours + hourSize / 60 * minutes + hourSize / 60 / 60 * seconds;
    }

    // not exactly 24h but close enough to look better
    return hourSize * (23.58) - calculateTop() + elementMetric.headerSize - 1;
  }

  /**
   * Calculates the left position of the activity cell based on the provided time entry and layout metrics.
   */
  const calculateLeft = (): number => (elementMetric?.x ?? 0) + (gap / 2.0);

  /**
   * Calculates the width of the activity cell based on the provided time entry and layout metrics.
   */
  const calculateWidth = () : number => (elementMetric?.width ?? 0) - gap;

  /**
   * Calculates the duration of the activity based on the provided time entry and current time.
   */
  const calculateDuration = () : number => {
    const startDate: Date = new Date(timeEntry.start);
    const endDate: Date = new Date(timeEntry.end ?? new Date().getTime());
    return endDate.getTime() - (startDate.getTime() - 5000);
  }

  /**
   * Converts the duration of the activity in milliseconds into a formatted string in the format "HH:MM:SS".
   */
  const calculateDurationString = () : string => {

    const hours: number = Math.floor(duration / (1000 * 60 * 60));
    const minutes: number = Math.floor(duration / (1000 * 60) % 60);
    const seconds: number = Math.floor(duration / 1000 % 60);

    return hours > 0
      ? `${hours}h${minutes.toString().padStart(2, '0')}min ${seconds.toString().padStart(2, '0')}s`
      : `${minutes}min ${seconds.toString().padStart(2, '0')}s`;
  }

  const { cellHeight } = useGrid();
  const { setNewTimeEntry } = useActivity();

  const [top, setTop] = useState<number>(calculateTop());
  const [left, setLeft] = useState<number>(calculateLeft());
  const [width, setWidth] = useState<number>(calculateWidth());
  const [height, setHeight] = useState<number>(calculateHeight());

  const [isOpen, setIsOpen] = useState<boolean>(newEntry);

  const [duration, setDuration] = useState<number>(calculateDuration());

  useEffect(() => {

    if (timeEntry.end) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setDuration(calculateDuration());
      setHeight(calculateHeight());
    }, 1000)

    return () => clearTimeout(timeoutId);
  }, [duration]);

  useEffect(() => {
    if (newEntry && !isOpen) {
      setNewTimeEntry(null);
    }
  }, [isOpen]);

  useEffect(() => {
    setTop(calculateTop());
    setLeft(calculateLeft());
    setWidth(calculateWidth());
    setHeight(calculateHeight());
  }, [elementMetric, timeEntry]);

  return <>
    <Popover placement={'left'}
             backdrop={'blur'}
             isOpen={isOpen}
             onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <div className={classes.previewCell}
             style={{
               top: `${top}px`,
               left: `${left}px`,
               width: `${width}px`,
               height: `${height}px`,
               backgroundColor: IntToHex(timeEntry.activity?.activityColor ?? HexToInt('#006FEE'))
             }}
             onClick={event => event.stopPropagation()}>
          <span>{timeEntry.activity?.name}</span><br/>
          <span className={classes.info}>{calculateDurationString()}</span>
          {/* todo check if this actually is needed seems a bit redundant to me*/}
          {/*<span className={classes.info}>{new Date(timeEntry.start).format()}</span><br/>*/}
          {/*<span className={classes.info}>{timeEntry.end ? new Date(timeEntry.end).format(): ' ... '}</span>*/}
        </div>
      </PopoverTrigger>
      <PopoverContent style={{backgroundColor: IntToHex(timeEntry.activity?.activityColor ?? HexToInt('#006FEE'))}}>
        <CellActivityEdit timeEntry={timeEntry}
                          newEntry={newEntry}
                          popoverClose={() => setIsOpen(false)}/>
      </PopoverContent>
    </Popover>
  </>;
};

// endregion

// region Export

export default CellActivity;

// endregion