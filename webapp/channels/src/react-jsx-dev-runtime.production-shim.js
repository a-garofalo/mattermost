// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// @mattermost/shared (and Rollup-bundled @mattermost/components) can import
// react/jsx-dev-runtime. The dev-runtime's production stub sets jsxDEV to undefined
// because production code is expected to use react/jsx-runtime instead. Map those
// imports to the real production JSX helpers for the web app bundle.

export {Fragment, jsx, jsxs} from 'react/jsx-runtime';
export {jsx as jsxDEV} from 'react/jsx-runtime';
