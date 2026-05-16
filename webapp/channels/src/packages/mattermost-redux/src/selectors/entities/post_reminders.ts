// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from '@mattermost/types/store';

export function getPostReminderTargetTime(state: GlobalState, postId: string): number | undefined {
    return state.entities.postReminders[postId];
}
