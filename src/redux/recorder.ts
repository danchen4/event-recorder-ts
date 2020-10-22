import { RootState } from './store';
import { Action } from 'redux';

interface RecorderState {
  dateStart: string;
}

///////////////////////// ACTION ///////////////////////////////
const START = 'recorder/start';
const STOP = 'recorder/stop';

///////////////////////// ACTIONS TYPES ///////////////////////////////
type StartAction = Action<typeof START>;
type StopAction = Action<typeof STOP>;

///////////////////////// ACTION CREATORS ///////////////////////////////
export const start = (): StartAction => ({
  type: START,
});

export const stop = (): StopAction => ({
  type: STOP,
});

///////////////////////// SELECTOR FUNCTION ///////////////////////////////
/**
 * selector function for useSelector();
 * recorder is recordReducer, which returns type RecorderState (which is inferred), and type RecorderState has one property: dateStart
 */
export const selectDateStart = (rootState: RootState) => rootState.recorder.dateStart;

///////////////////////// REDUCER ///////////////////////////////
const initialState: RecorderState = {
  dateStart: '',
};

export const recordReducer = (
  state: RecorderState = initialState,
  action: StartAction | StopAction
) => {
  switch (action.type) {
    case START:
      return { ...state, dateStart: new Date().toISOString() };
    case STOP:
      return { ...state, dateStart: '' };
    default:
      return state;
  }
};
