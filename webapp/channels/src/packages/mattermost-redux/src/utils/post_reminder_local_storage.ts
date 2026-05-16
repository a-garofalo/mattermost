// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const KEY_PREFIX = 'mattermost_post_reminders:';

function storageKey(userId: string): string {
    return KEY_PREFIX + userId;
}

export function readPostRemindersFromStorage(userId: string): Record<string, number> {
    if (typeof window === 'undefined' || !userId) {
        return {};
    }
    try {
        const raw = window.localStorage.getItem(storageKey(userId));
        if (!raw) {
            return {};
        }
        const parsed = JSON.parse(raw) as Record<string, number>;
        if (!parsed || typeof parsed !== 'object') {
            return {};
        }
        return parsed;
    } catch {
        return {};
    }
}

export function writePostRemindersToStorage(userId: string, reminders: Record<string, number>): void {
    if (typeof window === 'undefined' || !userId) {
        return;
    }
    try {
        if (Object.keys(reminders).length === 0) {
            window.localStorage.removeItem(storageKey(userId));
        } else {
            window.localStorage.setItem(storageKey(userId), JSON.stringify(reminders));
        }
    } catch {
        // Ignore storage quota or private mode errors
    }
}

export function clearPostRemindersStorage(userId: string): void {
    if (typeof window === 'undefined' || !userId) {
        return;
    }
    try {
        window.localStorage.removeItem(storageKey(userId));
    } catch {
        // noop
    }
}

export function filterFutureReminderTargets(reminders: Record<string, number>, nowSeconds: number): Record<string, number> {
    const next: Record<string, number> = {};
    for (const [postId, targetTime] of Object.entries(reminders)) {
        if (typeof targetTime === 'number' && targetTime > nowSeconds) {
            next[postId] = targetTime;
        }
    }
    return next;
}
