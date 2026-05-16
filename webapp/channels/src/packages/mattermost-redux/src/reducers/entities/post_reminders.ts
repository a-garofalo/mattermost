// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {AnyAction} from 'redux';

import type {Post} from '@mattermost/types/posts';

import {PostTypes, UserTypes} from 'mattermost-redux/action_types';

export type PostRemindersState = Record<string, number>;

export default function postReminders(state: PostRemindersState = {}, action: AnyAction): PostRemindersState {
    switch (action.type) {
    case PostTypes.RECEIVED_POST_REMINDER: {
        const {postId, targetTime} = action.data as {postId: string; targetTime: number};
        if (!postId || typeof targetTime !== 'number') {
            return state;
        }
        return {
            ...state,
            [postId]: targetTime,
        };
    }
    case PostTypes.REMOVED_POST_REMINDER: {
        const {postId} = action.data as {postId: string};
        if (!postId || !state[postId]) {
            return state;
        }
        const next = {...state};
        Reflect.deleteProperty(next, postId);
        return next;
    }
    case PostTypes.REPLACED_POST_REMINDERS: {
        const data = action.data as Record<string, number> | undefined;
        return data && typeof data === 'object' ? {...data} : {};
    }
    case PostTypes.POST_DELETED:
    case PostTypes.POST_REMOVED: {
        const post = action.data as Post;
        if (!post?.id || !state[post.id]) {
            return state;
        }
        const next = {...state};
        Reflect.deleteProperty(next, post.id);
        return next;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}
