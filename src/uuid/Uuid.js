/*
 * Copyright (c) 2010-2020 Robert Kieffer and other contributors
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file https://github.com/uuidjs/uuid/blob/master/LICENSE.md or https://opensource.org/licenses/MIT
 */

"use strict";

import { stringify } from '@app/uuid/stringify';
import rng from '@app/uuid/rng.js';

class Uuid {
    v4() {
        const rnds = rng();

        rnds[6] = rnds[6] & 0x0f | 0x40;
        rnds[8] = rnds[8] & 0x3f | 0x80;

        return stringify(rnds);
    }

}

export let uuid = new Uuid();