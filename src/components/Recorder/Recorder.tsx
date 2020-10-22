import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { selectDateStart, start, stop } from '../../redux/recorder';
import './Recorder.css';
import { addZero } from '../../lib/utils';
import { createUserEvent } from '../../redux/user-events';

/**
 * When clicking on the recorder button,
 *   if dateStart === ''
 *      then dispatch Action Creator start(), which sets dateStart to the current time
 *           start the interval that increments the count State every 1 second
 *   else if dateStart !== ''
 *      then clear the Interval
 *           dispatch Action Creator stop(), which sets dateStart to ''
 *
 * When component unmounts, clear the interval to prevent memory leaks
 */

export const Recorder: React.FC = () => {
  const dispatch = useDispatch();

  // dateStart is inferred to be a string because recordReducer returns RecorderState which has the dateStart string property
  const dateStart = useSelector(selectDateStart);
  // flag variable
  const started = dateStart !== '';
  let interval = useRef<number>(0);
  const [, setCount] = useState<number>(0);

  // Want to clear interval on unMount to prevent memory leaks
  useEffect(() => {
    return () => {
      window.clearInterval(interval.current);
    };
  }, []);

  // if started, then calculate the seconds that have passed since dateStart, otherwise 0
  let seconds = started ? Math.floor((Date.now() - new Date(dateStart).getTime()) / 1000) : 0;
  const hours = seconds ? Math.floor(seconds / 60 / 60) : 0;
  // subtract the number of seconds that went into the hour variable
  seconds -= hours * 60 * 60;
  const minutes = seconds ? Math.floor(seconds / 60) : 0;
  // subtract the number of seconds that went into the minutes variable to get the remaining seconds
  seconds -= minutes * 60;

  function handleClick() {
    if (started) {
      window.clearInterval(interval.current);
      dispatch(createUserEvent());
      dispatch(stop());
    } else {
      dispatch(start());
      /**
       * we use window.setInterval because it returns a number (like in a browser)
       * If we just used setInterval, it would return NodeJS.Timeout (or node's definition of a timeout)
       */
      interval.current = window.setInterval(() => {
        // Since count relies on the previous count, we should use a function that passes in the previous count
        setCount((prevCount) => prevCount + 1);
      }, 1000);
    }
  }

  return (
    <div className={cx('recorder', { 'recorder-started': started })}>
      <button className="recorder-record" onClick={handleClick}>
        <span></span>
      </button>
      <div className="recorder-counter">
        {addZero(hours)}:{addZero(minutes)}:{addZero(seconds)}
      </div>
    </div>
  );
};
