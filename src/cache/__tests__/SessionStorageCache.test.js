/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {afterAll, afterEach, beforeAll, describe, test} from "@jest/globals";
import {sessionStorageCache} from "@app/cache/SessionStorageCache";
import Logger from "@app/logs/Logger";

beforeAll(() => {
    Logger.setLogLevel('all');
});

afterAll(() => {
    Logger.setLogLevel('none');
});

describe("set and get function", () => {

    afterEach(() => {
        sessionStorage.clear();
    });

    test("successfully save and retrieves the session storage", () => {

        let key = "KEY";
        let value = "VALUE";

        sessionStorageCache.set(key, value);
        expect(sessionStorageCache.get(key)).toEqual(value);

    });

    test("return null if session storage dose not exits", () => {

        expect(sessionStorageCache.get("KEY")).toEqual(null);

    });

});