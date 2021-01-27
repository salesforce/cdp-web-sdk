/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

"use strict";

import {eventClientConfig} from "@app/settings/Constants"

export const baseConfiguration = {
    client: {
        appSourceId: "",
        deviceId: "",
        beaconEndpoint: "",
        authEndpoint: "",
        sessionId: "",
        automaticallyTrackNavigationEvents: eventClientConfig.TRACK_NAVIGATION_EVENTS,
        retryAttempts: eventClientConfig.REQUEST_RETRY_ATTEMPTS,
        retryDelayMS: eventClientConfig.REQUEST_RETRY_DELAY_MS,
        consentEventTypeName: eventClientConfig.CONSENT_EVENT_TYPE_NAME
    },
    schemas: {},
    transforms: {},
    dataProviders: {},
    conditions: {},
    signals: [],
    selectors: {}
};