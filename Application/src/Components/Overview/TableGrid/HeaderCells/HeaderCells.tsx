import classes from './HeaderCells.module.scss';
import {DateValue, getDayOfWeek} from '@internationalized/date';

// region Interface

interface IProps {
  days: DateValue[];
}

// endregion

// region Component

const HeaderCells = ({days}: IProps) => {

  /**
   *
   * @param date
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