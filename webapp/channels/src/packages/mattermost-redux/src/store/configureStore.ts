// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {composeWithDevTools} from '@redux-devtools/extension';
import {
    applyMiddleware,
    legacy_createStore,
} from 'redux';
import type {
    AnyAction,
    Middleware,
    MiddlewareAPI,
    Reducer,
    Store,
} from 'redux';
import {withExtraArgument as thunkWithExtraArgument} from 'redux-thunk';

import type {GlobalState} from '@mattermost/types/store';

import {createReducer} from './helpers';
import initialState from './initial_state';
import reducerRegistry from './reducer_registry';

import {PostTypes, UserTypes} from '../action_types';
import serviceReducers from '../reducers';
import {getCurrentUserId} from '../selectors/entities/users';
import {clearPostRemindersStorage, writePostRemindersToStorage} from '../utils/post_reminder_local_storage';

function postReminderStorageMiddleware({getState}: MiddlewareAPI<GlobalState>): Middleware {
    return (next) => (action: AnyAction) => {
        const userIdBeforeLogout = action.type === UserTypes.LOGOUT_SUCCESS ? getCurrentUserId(getState()) : '';

        const result = next(action);

        if (action.type === UserTypes.LOGOUT_SUCCESS) {
            if (userIdBeforeLogout) {
                clearPostRemindersStorage(userIdBeforeLogout);
            }
            return result;
        }

        if (
            action.type === PostTypes.RECEIVED_POST_REMINDER ||
            action.type === PostTypes.REMOVED_POST_REMINDER ||
            action.type === PostTypes.REPLACED_POST_REMINDERS ||
            action.type === PostTypes.POST_DELETED ||
            action.type === PostTypes.POST_REMOVED
        ) {
            const state = getState();
            const userId = getCurrentUserId(state);
            if (userId) {
                writePostRemindersToStorage(userId, state.entities.postReminders);
            }
        }

        return result;
    };
}

/**
 * Configures and constructs the redux store. Accepts the following parameters:
 * preloadedState - Any preloaded state to be applied to the store after it is initially configured.
 * appReducer - An object containing any app-specific reducer functions that the client needs.
 * getAppReducers - A function that returns the appReducer as defined above. Only used in development to enable hot reloading.
 */
export default function configureStore<S extends GlobalState>({
    appReducers,
    preloadedState,
}: {
    appReducers: Record<string, Reducer>;
    getAppReducers: () => Record<string, Reducer>;
    preloadedState: Partial<S>;
}): Store {
    const baseState = {
        ...initialState,
        ...preloadedState,
    };

    const composeEnhancers = composeWithDevTools({
        shouldHotReload: false,
        trace: true,
        traceLimit: 25,
        autoPause: true,
    });

    const middleware = applyMiddleware(
        postReminderStorageMiddleware,

        // @hmhealey I've added this extra argument to Thunks to store information related to the store that can't be
        // part of Redux state itself. At the moment, this is so that I can attach let DataLoaders dispatch actions.
        // If you want to make use of this, talk to me first since I want to know more.
        thunkWithExtraArgument({loaders: {}}),
    );

    const enhancers = composeEnhancers(middleware);

    const baseReducer = createReducer(serviceReducers, appReducers);

    const store = legacy_createStore(
        baseReducer,
        baseState,
        enhancers,
    );

    reducerRegistry.setChangeListener((reducers: Record<string, Reducer>) => {
        store.replaceReducer(createReducer(reducers, serviceReducers, appReducers));
    });

    return store;
}
