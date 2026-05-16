// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PostTypes} from 'mattermost-redux/action_types';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import type {ActionFunc, ActionFuncAsync} from 'mattermost-redux/types/actions';
import {filterFutureReminderTargets, readPostRemindersFromStorage} from 'mattermost-redux/utils/post_reminder_local_storage';

export function dismissPostReminder(postId: string): ActionFunc {
    return (dispatch) => {
        dispatch({
            type: PostTypes.REMOVED_POST_REMINDER,
            data: {postId},
        });
        return {data: true};
    };
}

export function hydratePostReminders(): ActionFuncAsync {
    return async (dispatch, getState) => {
        const userId = getCurrentUserId(getState());
        if (!userId) {
            return {data: false};
        }

        const nowSec = Math.floor(Date.now() / 1000);
        const fromStorage = filterFutureReminderTargets(readPostRemindersFromStorage(userId), nowSec);

        dispatch({
            type: PostTypes.REPLACED_POST_REMINDERS,
            data: fromStorage,
        });

        return {data: true};
    };
}
