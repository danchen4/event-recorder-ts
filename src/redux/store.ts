import { recordReducer } from './recorder';
import thunk from 'redux-thunk';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { userEventsReducer } from './user-events';

/**
 * Could do something like below and import every feature, but that leads to a lot of boilerplate
 * 
  export interface RootState {
    userEvents: UserEventsState
  } 
 *
 * Better option is to infer the root state, but using a Utility type called Return type
*/

const rootReducer = combineReducers({
  userEvents: userEventsReducer,
  recorder: recordReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer, applyMiddleware(thunk));
