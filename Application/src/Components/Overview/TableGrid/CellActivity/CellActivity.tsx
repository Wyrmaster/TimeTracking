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

const CellActivity = ({ timeEntry, date, elementMetric, newEntry = false }: IProps) => {

  const calculateTop = () : number => {
    const hourSize: number = cellHeight + 1;
    const startDate: Date = new Date(timeEntry.start);

    if (startDate.compare(date)){
      return elementMetric?.headerSize +  hourSize * (startDate.getHours() + startDate.getMinutes() / 60.0);
    }

    return elementMetric?.headerSize ?? 0;
  }

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

  const calculateLeft = (): number => (elementMetric?.x ?? 0) + (gap / 2.0);

  const calculateWidth = () : number => (elementMetric?.width ?? 0) - gap;

  const calculateDuration = () : number => {
    const startDate: Date = new Date(timeEntry.start);
    const endDate: Date = new Date(timeEntry.end ?? new Date().getTime());
    return endDate.getTime() - (startDate.getTime() - 5000);
  }

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