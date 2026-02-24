import classes from './HeaderCells.module.scss';
import {DateValue, getDayOfWeek} from '@internationalized/date';

// region Interface

interface IProps {
  days: DateValue[];
}

// endregion

// region Component

/**
 * A functional component that generates header cells for a calendar or date-related table.
 *
 * @param {IProps} props - The properties object for the component.
 * @param {Array<DateValue>} props.days - An array of DateValue objects representing the days to be displayed in the header.
 * @returns {JSX.Element} A rendered JSX element containing the header cells for the days, including their day of the week and formatted date.
 */
const HeaderCells = ({days}: IProps) => {


  /**
   * Returns the day of the week as a string for a given date.
   *
   * @param {DateValue} date - The input date value for which the day of the week needs to be determined.
   * @returns {string} The name of the day of the week (e.g., "Sunday", "Monday").
   * TODO move this to i18next
   */
  const getDateString = (date: DateValue): string => {
    switch (getDayOfWeek(date, 'en-US')) {
      case 0: return 'Sunday';
      case 1: return 'Monday';
      case 2: return 'Tuesday';
      case 3: return 'Wednesday';
      case 4: return 'Thursday';
      case 5: return 'Friday';
      case 6: return 'Saturday';
      default: return '';
    }
  };

  return <>
    <div className={classes.headerWrapper}>
      <div className={classes.tableHeader}>
        <div/>
        {
          days.map(d => <div key={d.toString()}
                             className={classes.contentHeader}>
            <span>{getDateString(d)}</span><br/>
            <span>
              {d.day.toString().padStart(2, '0')}/
              {d.month.toString().padStart(2, '0')}/
              {d.year.toString()}
            </span>
          </div>)
        }
      </div>
    </div>
  </>;
};

// endregion

// region Export

export default HeaderCells;

// endregion