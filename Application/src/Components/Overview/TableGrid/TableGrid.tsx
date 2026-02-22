import classes from './TableGrid.module.scss';
import { useEffect, useRef, } from 'react';
import { DatePicker, Switch, } from '@heroui/react';
import DayRows from './DayRows/DayRows.tsx';
import HeaderCells from './HeaderCells/HeaderCells.tsx';
import { useGrid } from '../../../Providers/GridProvider.tsx';
import { useActivity } from '../../../Providers/ActivityProvider.tsx';

// region Interface

interface IProps {

}

// endregion

// region Component

const TableGrid = ({}: IProps) => {

  const { useWorkWeek, setUseWorkWeek, weekDays, date, setDate } = useActivity();

  // Create a reference for the scrollable div
  const gridRef = useRef<HTMLDivElement|null>(null);

  const { changeCellHeight } = useGrid();

  useEffect(() => {
    handleScrollArea();

    gridRef.current?.addEventListener('wheel', handleWheelZoom);

    return () => {
      gridRef.current?.removeEventListener('wheel', handleWheelZoom);
    }
  }, [gridRef]);

  useEffect(() => {


    window.addEventListener('resize', handleScrollArea);

    return () => {
      window.removeEventListener('resize', handleScrollArea);
    };
  }, []);

  const handleScrollArea = () => {
    const element: HTMLDivElement | null = gridRef.current as unknown as HTMLDivElement;
    if (element == null) {
      return;
    }

    element.scrollTo({
      top: element.scrollHeight * 0.3,
      behavior: 'instant'
    });
  };

  const handleWheelZoom = (event: WheelEvent) => {
    if (!event.ctrlKey) {
      return;
    }
    event.preventDefault();

    if (event.deltaY > 0) {
      changeCellHeight(true)
    }
    else {
      changeCellHeight(false);
    }
  };

  return <>
    <div className={['flex', 'flex-col', 'grow', 'overflow-hidden'].join(' ')}>
      <div className={[classes.control].join(' ')} style={{minHeight: '80px'}}>
        <Switch isSelected={useWorkWeek}
                classNames={{label: classes.switchLabel}}
                onValueChange={() => setUseWorkWeek(!useWorkWeek)}>
          Use Work Week
        </Switch>
        <DatePicker value={date}
                    showMonthAndYearPickers
                    variant={'flat'}
                    onChange={value => setDate(value!)} />
      </div>
      <div className={['flex','flex-col', 'grow', 'overflow-auto', 'relative'].join(' ')}
           ref={gridRef}>
        <HeaderCells days={weekDays}/>
        <DayRows dates={weekDays}/>
      </div>
    </div>
  </>;
};

// endregion

// region Export

export default TableGrid;

// endregion