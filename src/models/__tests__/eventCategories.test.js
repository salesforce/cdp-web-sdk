/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {describe, test} from "@jest/globals";
import {eventCategories} from '@app/models/eventCategories';

describe("event Categories", () => {

    test("has required fields", () => {
        expect('ENGAGEMENT' in eventCategories).toEqual(true);
        expect('PROFILE' in eventCategories).toEqual(true);
        expect('CONSENT' in eventCategories).toEqual(true);
    });

});