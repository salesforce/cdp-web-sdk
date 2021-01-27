/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

"use strict";

import Logger from '@app/logs/Logger';

const LOGGER_NAME = "SessionStorageCache.js";

class SessionStorageCache {

    set(key, value) {
        sessionStorage.setItem(key, value);
        Logger.info(LOGGER_NAME, `Session storage with key ${key} and value ${value} saved.`);
    }

    get(key) {
        Logger.info(LOGGER_NAME,"Retrieving session storage with key of ${key}");
        return sessionStorage.getItem(key);
    }
}

export let sessionStorageCache = new SessionStorageCache();