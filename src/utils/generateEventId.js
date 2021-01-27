/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import sha1 from '@app/utils/sha1';

export default function generateEventId() {
    const dateTime = new Date().getTime;
    const raw = window.navigator.userAgent + window.navigator.platform + dateTime + JSON.stringify({}) + Math.random();
    return sha1(raw).slice(0, 16);
}
