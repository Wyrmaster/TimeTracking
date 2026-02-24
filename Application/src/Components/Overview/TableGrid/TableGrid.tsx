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

/**
 * Represents a table grid component for managing and displaying a customizable schedule
 * with interactive functionalities such as zooming, scrolling, and date selection.
 *
 * This component is tailored to render a calendar-like interface with a focus on
 * "Work Week" toggling, date selection, and seamless interaction with the grid via
 * mouse and wheel events. All grid handling is managed through internal hooks and
 * effects to ensure a responsive and dynamic user interface.
 *
 * Dependencies:
 * - Provides integration with `useActivity` and `useGrid` hooks to manage application-specific state.
 * - Utilizes `Switch` for toggling "Work Week" mode and `DatePicker` for date selection.
 * - Implements `HeaderCells` for rendering grid headers and `DayRows` for row rendering.
 *
 * State Management:
 * - `useWorkWeek`: Boolean determining if "Work Week" is enabled.
 * - `setUseWorkWeek`: Function for toggling "Work Week."
 * - `weekDays`: Array of week day mappings for header and rows.
 * - `date`: Current selected date.
 * - `setDate`: State handler for updating the selected date.
 *
 * Key Features:
 * - Zooming with scroll-wheel functionality (Ctrl + Mouse Wheel).
 * - Auto-scroll logic for adjusting the grid's scroll position during resize.
 * - Dynamic grid resizing for responsiveness to viewport changes.
 * - Handles cleanup of event listeners for wheel and resize events.
 *
 * Refs:
 * - `gridRef`: Reference to the primary scrollable grid container for dynamically modifying its properties.
 *
 * Hooks:
 * - `useEffect`: Manages side effects such as attaching/detaching event listeners for grid interactions (zooming and resizing).
 *
 * Internal Methods:
 * - `handleScrollArea`: Scrolls the grid to a preset position during initializations and on resize.
 * - `handleWheelZoom`: Manages zoom functionality based on scroll-wheel events and adjusts cell height.
 */
const TableGrid = ({}: IProps) => {

  const { useWorkWeek, setUseWorkWeek, weekDays, date, setDate } = useActivity();

  // Create a reference for the scrollable div
  const gridRef = useRef<HTMLDivElement|null>(null);

  const { changeCellHeight } = useGrid();

  useEffect(() => {
    setScrollPosition();

    gridRef.current?.addEventListener('wheel', handleWheelZoom);

    return () => {
      gridRef.current?.removeEventListener('wheel', handleWheelZoom);
    }
  }, [gridRef]);

  useEffect(() => {
    window.addEventListener('resize', setScrollPosition);

    return () => {
      window.removeEventListener('resize', setScrollPosition);
    };
  }, []);

  /**
   * Sets the scroll position of a target element to 30% of its total scrollable height.
   * The scroll adjustment is executed instantly, bypassing any smooth or animated scrolling effects.
   *
   * This function retrieves a reference to the target element and applies the scroll adjustment
   * only if the element reference is valid and not null.
   *
   * The function is typically used for programmatically controlling the scroll position
   * of a specific container element.
   */
  const setScrollPosition = () => {
    const element: HTMLDivElement | null = gridRef.current as unknown as HTMLDivElement;
    if (element == null) {
      return;
    }

    element.scrollTo({
      top: element.scrollHeight * 0.3,
      behavior: 'instant'
    });
  };

  /**
   * Handles zoom functionality triggered by mouse wheel events while holding the control key.
   * The function adjusts the height of cells based on the direction of the wheel scroll.
   *
   * @param {WheelEvent} event - The wheel event containing information about the mouse scroll direction and modifier keys.
   *        If the control key (`ctrlKey`) is not pressed, the function will return immediately without taking action.
   *
   *        If the `deltaY` property of the event is positive, the height of the cells will be increased.
   *        If `deltaY` is negative, the height of the cells will be decreased.
   *
   *        The function also prevents the default browser behavior for wheel events to avoid unintended side effects.
   */
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