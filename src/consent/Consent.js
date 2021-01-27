/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

"use strict";

import {cookieUtility} from "@app/cookies/cookieUtility";
import {identityConfig} from '@app/settings/Constants';
import Logger from "@app/logs/Logger";

const LOGGER_NAME = "Consent.js"

export default class Consent {
    constructor(identity) {
        this.cookieName = identityConfig.CONSENT_COOKIE_NAME;
        this.identity = identity;
    }

    getConsent() {
        return cookieUtility.getCookie(this.cookieName);
    }

    grantConsent() {
        let date = new Date();
        date.setTime(date.getTime() + (identityConfig.UUID_EXP_DAYS * 24 * 60 * 60 * 1000));

        let cookieConfig = {
            name: this.cookieName,
            data: "opt_in",
            cookieParams: {
                expires: "",
                path: '/'
            }
        }

        cookieUtility.newCookie(cookieConfig);
        this.identity.setCustomerIdentityCookie();
        Logger.info(LOGGER_NAME, `Consent granted successfully`);
    }

    removeConsent() {
        cookieUtility.deleteCookie(this.cookieName);
        cookieUtility.deleteCookie(identityConfig.UUID_NAME);
        Logger.info(LOGGER_NAME, `Consent removed successfully`);
    }
}