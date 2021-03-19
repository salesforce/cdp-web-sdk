/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

"use strict";

const identityConfig = {
    UUID_NAME: 'CustomerCookieID',
    UUID_EXP_DAYS: '180',
    CONSENT_COOKIE_NAME: 'CustomerConsentCookie'
}

const loggerConfig = {
    LOG_LEVEL: 'none', //error (shows errors), debug (shows error and warnings), all or none
    APP_NAME: "CDP_WEB_SDK"
}

const eventClientConfig = {
    EVENT_PARAM_NAME: 'event',
    MAX_URL_LENGTH: 8192, // default from Evergage beacon
    REQUEST_RETRY_ATTEMPTS: 3,
    REQUEST_RETRY_DELAY_MS: 3000,
    CONSENT_EVENT_TYPE_NAME: 'consentLog',
    CONSENT_EVENT_CATEGORY_NAME: "Consent",
    CONSENT_OPT_IN_OBJECT: {
        status: 'opt-in'
    },
    CONSENT_OPT_OUT_OBJECT: {
        status: 'opt-out'
    },
    TRACK_NAVIGATION_EVENTS: false,
    NAVIGATION_EVENT_SCHEMA: "navigation"
}

const engineConfig = {
    MUTATION_OBSERVER: {
        CONFIG: {
            attributes: true,
            childList: true,
            subtree: true
        },
        SELECTOR: 'body',
        DEBOUNCE_TIME_MS: 250
    }
}

module.exports = {
    identityConfig,
    loggerConfig,
    eventClientConfig,
    engineConfig
};
