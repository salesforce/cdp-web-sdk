/*
 * Copyright (c) 2010-2020 Robert Kieffer and other contributors
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file https://github.com/uuidjs/uuid/blob/master/LICENSE.md or https://opensource.org/licenses/MIT
 */

"use strict";

export function stringify(arr, offset = 0) {
    const byteToHex = [];

    for (let i = 0; i < 256; ++i) {
        byteToHex.push((i + 0x100).toString(16).substr(1));
    }

    return (byteToHex[arr[offset]] +
        byteToHex[arr[offset + 1]] +
        byteToHex[arr[offset + 2]] +
        byteToHex[arr[offset + 3]] + '-' +
        byteToHex[arr[offset + 4]] +
        byteToHex[arr[offset + 5]] + '-' +
        byteToHex[arr[offset + 6]] +
        byteToHex[arr[offset + 7]] + '-' +
        byteToHex[arr[offset + 8]] +
        byteToHex[arr[offset + 9]] + '-' +
        byteToHex[arr[offset + 10]] +
        byteToHex[arr[offset + 11]] +
        byteToHex[arr[offset + 12]] +
        byteToHex[arr[offset + 13]] +
        byteToHex[arr[offset + 14]] +
        byteToHex[arr[offset + 15]]).toLowerCase();
}

