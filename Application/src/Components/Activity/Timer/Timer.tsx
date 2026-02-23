import classes from './Timer.module.scss';
import {useEffect, useState} from 'react';
import FractionSpinner from '../FractionSpinner/FractionSpinner.tsx';

// region Interface

interface IProps {
  timestamp: Date;
}

// endregion

// region Component

/**
 * Timer component calculates and displays the elapsed time in the format "HH:MM:SS"
 * since the provided timestamp.
 *
 * The component internally tracks the elapsed time using a state variable, which is
 * updated every 900 milliseconds. It renders the formatted elapsed time based on the
 * difference between the current time and the provided timestamp.
 *
 * @param {Object} IProps - The properties for the Timer component.
 * @param {Date} IProps.timestamp - The starting timestamp to calculate the elapsed time from.
 * @returns {JSX.Element} A JSX element displaying the formatted elapsed time.
 */
const Timer = ({timestamp}: IProps) => {

  const [duration, setDuration] = useState<number>(0);

  // increment the time counter
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - timestamp.getTime();
      if (diff < 0) return (
        setDuration(0)
      )
      setDuration(diff);
    }, 900);

    return () => clearInterval(interval);
  }, [timestamp]);

  /**
   * Converts a duration in milliseconds into a formatted string in the format "HH:MM:SS".
   *
   * The function calculates the hours, minutes, and seconds from the given duration in milliseconds
   * and formats them into a readable string representation. Minutes and seconds are always padded to
   * two digits.
   *
   * @function
   * @param {number} duration - The duration in milliseconds to be converted into a time string.
   * @returns {JSX.Element} A JSX element containing the formatted duration string in "HH:MM:SS" format.
   */
  const getDurationString = () => {
    // get hours / 1000 / 60 / 60
    const hours: number = Math.floor(duration / (1000 * 60 * 60));
    // get minuts / 1000 / 60
    const minutes: number = Math.floor(duration / (1000 * 60) % 60);
    //get seconds / 1000
    const seconds: number = Math.floor(duration / 1000 % 60);

    return <>
      <span>
        {`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
      </span>
    </>
  }

  return <>
    <div className={[classes.timer].join(' ')}>
      {getDurationString()}
      <FractionSpinner/>
    </div>
  </>;
};

// endregion

// region Export

export default Timer;

// endregion