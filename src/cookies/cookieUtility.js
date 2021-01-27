/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

"use strict";

import Logger from '@app/logs/Logger';

const LOGGER_NAME = "cookieUtility.js"

class CookieUtility {

    newCookie(cookieConfig) {
        this._validateCookieParams(cookieConfig);
        let cookieContent = this.objectToCookie(cookieConfig);
        document.cookie = cookieContent;

        Logger.info(LOGGER_NAME, 'Successfully created a new cookie with this config: ', cookieConfig);
    }

    getCookie(cookieName) {
        let cookies = document.cookie.split(';');
        let foundCookie;

        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].trim().startsWith(`${cookieName}=`)) {
                foundCookie = cookies[i];
                break;
            }
        }

        if (!foundCookie) {
            Logger.warn(LOGGER_NAME, `${cookieName} was not found in cookies`)
        }

        return foundCookie ? this.cookieToObject(foundCookie) : null;
    }

    cookieExists(cookieName) {
        let foundCookie = document.cookie.split(';').some((item) => item.trim().startsWith(`${cookieName}=`));

        if (!foundCookie) {
            Logger.warn(LOGGER_NAME, `${cookieName} was not found in cookies`)
        }

        return foundCookie;
    }

    deleteCookie(cookieName) {
        if(this.cookieExists(cookieName)) {
            document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    }

    cookieToObject(cookieString) {
        let cookieConfig = {
            name: "",
            data: "",
            cookieParams: {},
            cookieFlags: []
        }

        try{
            cookieString
                .split(';')
                .reduce((acc, value, index) => {
                    let keyValue = value.split("=");
                    if (index === 0 && keyValue.length === 2) {
                        acc.name = this._parseCookieData(keyValue[0]);
                        acc.data = this._parseCookieData(keyValue[1]);
                    } else {
                        if(keyValue.length > 1) {
                            acc.cookieParams[keyValue[0]] = keyValue[1];
                        } else {
                            acc.cookieFlags.push(keyValue[0]);
                        }
                    }
                    return acc;
                }, cookieConfig);

            return cookieConfig;

        } catch (e) {
            Logger.error(LOGGER_NAME, `Error converting ${cookieString} to object.`, e);
            return null;
        }
    }

    objectToCookie(cookieObj) {
        this._validateCookieParams(cookieObj);
        let cookieParams = [];

        cookieParams.push(`${cookieObj.name}=${cookieObj.data}`);

        if (cookieObj.cookieParams) {
            Object.entries(cookieObj.cookieParams).forEach(([key, value]) => {
                cookieParams.push(`${key}=${value}`);
            });
        }

        if (cookieObj.cookieFlags) {
            cookieObj.cookieFlags.forEach((flag) => {
                cookieParams.push(flag);
            });
        }

        return cookieParams.join(';');
    }

    _parseCookieData(value) {
        return decodeURIComponent(value.trim());
    }

    _validateCookieParams(cookieConfig) {
        if (!cookieConfig.name) {
            Logger.error(LOGGER_NAME, 'cookieConfig.name is required', cookieConfig);
            throw new Error('cookieConfig.name is required');
        }
        if (!cookieConfig.data) {
            Logger.error(LOGGER_NAME, 'cookieConfig.data is required', cookieConfig);
            throw new Error('cookieConfig.data is required');
        }
    }
}

export let cookieUtility = new CookieUtility();
