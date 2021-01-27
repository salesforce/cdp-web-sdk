/*
 * Copyright (c) 2010-2020 Robert Kieffer and other contributors
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file https://github.com/uuidjs/uuid/blob/master/LICENSE.md or https://opensource.org/licenses/MIT
 */

"use strict";

var getRandomValues = typeof crypto !== 'undefined' &&
    crypto.getRandomValues &&
    crypto.getRandomValues.bind(crypto) ||
    typeof msCrypto !== 'undefined' &&
    typeof msCrypto.getRandomValues === 'function' &&
    msCrypto.getRandomValues.bind(msCrypto);

var rnds8 = new Uint8Array(16);

export default function rng() {
    if (!getRandomValues) {
        throw new Error('not supported.');
    }

    return getRandomValues(rnds8);
}