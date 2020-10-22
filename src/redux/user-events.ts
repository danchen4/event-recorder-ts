import { Action, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { selectDateStart } from './recorder';
import { RootState } from './store';

export interface UserEvent {
  id: number;
  title: string;
  dateStart: string;
  dateEnd: string;
}

interface UserEventsState {
  /**
   * Record<K,T> is Utility type that represents a Map.
   * K: Key
   * T: Value
   */
  byIds: Record<UserEvent['id'], UserEvent>;
  /** Array of IDs */
  allIds: UserEvent['id'][];
}

///////////////////////// ACTIONS ///////////////////////////////

const LOAD_REQUEST = 'userEvents/load_request';
const LOAD_SUCCESS = 'userEvents/load_success';
const LOAD_FAILURE = 'userEvents/load_failure';

const CREATE_REQUEST = 'userEvents/create_request';
const CREATE_SUCCESS = 'userEvents/create_success';
const CREATE_FAILURE = 'userEvents/create_failure';

const DELETE_REQUEST = 'userEvents/delete_request';
const DELETE_SUCCESS = 'userEvents/delete_success';
const DELETE_FAILURE = 'userEvents/delete_failure';

///////////////////////// ACTIONS TYPES ///////////////////////////////
interface LoadRequestAction extends Action<typeof LOAD_REQUEST> {}
interface LoadSuccessAction extends Action<typeof LOAD_SUCCESS> {
  payload: {
    events: UserEvent[];
  };
}
interface LoadFailureAction extends Action<typeof LOAD_FAILURE> {
  error: string;
}

interface CreateRequestAction extends Action<typeof CREATE_REQUEST> {}
interface CreateSuccessAction extends Action<typeof CREATE_SUCCESS> {
  payload: {
    event: UserEvent;
  };
}
interface CreateFailureAction extends Action<typeof CREATE_FAILURE> {}

interface DeleteRequestAction extends Action<typeof DELETE_REQUEST> {}
interface DeleteSuccessAction extends Action<typeof DELETE_SUCCESS> {
  payload: { id: UserEvent['id'] };
}
interface DeleteFailureAction extends Action<typeof DELETE_FAILURE> {}

///////////////////////// ACTION CREATORS ///////////////////////////////

/**
type ThunkAction<R, S, E, A extends Action> = (
  dispatch: ThunkDispatch<S, E, A>,
  getState: () => S,
  extraArgument: E
) => R;
 
R: Return value of thunk action 
S: root state of app
E: extraAgrument (see docs)
A: actions that we plan to dispatch with Dispatch function that Thunk Action provides
 */

/**
 * Load User Events
 */
export const loadUserEvents = (): ThunkAction<
  void,
  RootState,
  undefined,
  LoadRequestAction | LoadSuccessAction | LoadFailureAction
> => async (dispatch, getState) => {
  dispatch({
    type: LOAD_REQUEST,
  });

  try {
    const response = await fetch('http://localhost:3001/events');

    /**
     * .json() returns a Promise of type any, so events is of type any
     * Can assign events type to what we want (or what we are expecting to get back)
     * However, doesn't check response during run time so this can produce an error
     *
     * In real-life
     * The API developers should be generating the types of the data that is being returned by the endpoints
     * and providing those types to the UI developers so they can import it to use the types to describe the events object
     */
    const events: UserEvent[] = await response.json();
    dispatch({
      type: LOAD_SUCCESS,
      payload: {
        events: events,
      },
    });
  } catch (err) {
    dispatch({
      type: LOAD_FAILURE,
      error: 'Failure to load events.',
    });
  }
};

/**
 * Create User Event
 */
export const createUserEvent = (): ThunkAction<
  Promise<void>, // async functions returns a Promise that resolves to void
  RootState,
  undefined,
  CreateRequestAction | CreateSuccessAction | CreateFailureAction
> => async (dispatch, getState) => {
  dispatch({
    type: CREATE_REQUEST,
  });

  try {
    // get Start Date from the recorder
    const dateStart = selectDateStart(getState());
    const event: Omit<UserEvent, 'id'> = {
      title: 'No name',
      dateStart,
      dateEnd: new Date().toISOString(),
    };

    const response = await fetch('http://localhost:3001/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    const createdEvent: UserEvent = await response.json();

    dispatch({
      type: CREATE_SUCCESS,
      payload: {
        event: createdEvent,
      },
    });
  } catch (err) {
    dispatch({
      type: CREATE_FAILURE,
    });
  }
};

/**
 * Delete User Event
 */
export const deleteUserEvent = (
  id: UserEvent['id']
): ThunkAction<
  Promise<void>, // async functions returns a Promise that resolves to void
  RootState,
  undefined,
  DeleteRequestAction | DeleteSuccessAction | DeleteFailureAction
> => async (dispatch) => {
  dispatch({
    type: DELETE_REQUEST,
  });

  try {
    const response = await fetch(`http://localhost:3001/events/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      dispatch({
        type: DELETE_SUCCESS,
        payload: { id },
      });
    }
  } catch (err) {
    dispatch({
      type: DELETE_FAILURE,
    });
  }
};

const UPDATE_REQUEST = 'userEvents/update_request';
interface UpdateRequestAction extends Action<typeof UPDATE_REQUEST> {}

const UPDATE_SUCCESS = 'userEvents/update_success';
interface UpdateSuccessAction extends Action<typeof UPDATE_SUCCESS> {
  payload: {
    event: UserEvent;
  };
}

const UPDATE_FAILURE = 'userEvents/update_failure';
interface UpdateFailureAction extends Action<typeof UPDATE_FAILURE> {}

/**
 * Update User
 */
export const updateUserEvent = (
  event: UserEvent
): ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  UpdateRequestAction | UpdateSuccessAction | UpdateFailureAction
> => async (dispatch) => {
  dispatch({
    type: UPDATE_REQUEST,
  });

  try {
    const response = await fetch(`http://localhost:3001/events/${event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    const updatedEvent: UserEvent = await response.json();
    dispatch({
      type: UPDATE_SUCCESS,
      payload: { event },
    });
  } catch (err) {
    dispatch({
      type: UPDATE_FAILURE,
    });
  }
};

///////////////////////// SELECTOR FUNCTION ///////////////////////////////
const selectUserEventsState = (rootState: RootState) => rootState.userEvents;

export const selectUserEventsArray = (rootState: RootState) => {
  const state = selectUserEventsState(rootState);
  return state.allIds.map((id) => state.byIds[id]);
};

///////////////////////// REDUCER ///////////////////////////////
const initialState: UserEventsState = {
  byIds: {},
  allIds: [],
};

export const userEventsReducer = (
  state: UserEventsState = initialState,
  action: LoadSuccessAction | CreateSuccessAction | DeleteSuccessAction | UpdateSuccessAction
) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      const { events } = action.payload;
      return {
        ...state,
        allIds: events.map(({ id }) => id),
        byIds: events.reduce<UserEventsState['byIds']>((byIds, event) => {
          byIds[event.id] = event;
          return byIds;
        }, {}),
      };
    case CREATE_SUCCESS:
      const { event } = action.payload;
      return {
        ...state,
        allIds: [...state.allIds, event.id],
        byIds: { ...state.byIds, [event.id]: event },
      };
    case DELETE_SUCCESS:
      const { id } = action.payload;
      const newState = {
        ...state,
        byIds: { ...state.byIds },
        allIds: state.allIds.filter((storedId) => storedId !== id),
      };
      delete newState.byIds[id];
      return newState;
    case UPDATE_SUCCESS:
      // Should move each of these switch cases to dedicated functions so dont' have issues with conflicting variable names (like 'event' in this case)
      const { event: updatedEvent } = action.payload;
      return {
        ...state,
        byIds: { ...state.byIds, [updatedEvent.id]: updatedEvent },
      };
    default:
      return state;
  }
};
