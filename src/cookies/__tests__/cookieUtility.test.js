/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {afterAll, afterEach, beforeAll, describe, test} from "@jest/globals";
import {cookieUtility} from "@app/cookies/cookieUtility";
import Logger from "@app/logs/Logger";

function clearAllCookies() {
    let cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        let name = cookies[i].indexOf("=") > -1 ? cookies[i].substr(0, cookies[i].indexOf("=")) : cookies[i];
        document.cookie = name + "=;expires=Thu, 01 Jan 1900 00:00:00 GMT";
    }
}

beforeAll(() => {
    Logger.setLogLevel('all');
});

afterAll(() => {
    Logger.setLogLevel('none');
});

describe("newCookie function", () => {

    afterEach(() => {
        clearAllCookies()
    });

    test("throws exception if cookieConfig.name not present", () => {

        let cookieConfig = {
            data: "dummy_data"
        }

        expect(() => {
            cookieUtility.newCookie(cookieConfig)
        }).toThrow('cookieConfig.name is required');

    });

    test("throws exception if cookieConfig.data not present", () => {

        let cookieConfig = {
            name: "dummy_name"
        }

        expect(() => {
            cookieUtility.newCookie(cookieConfig)
        }).toThrow('cookieConfig.data is required');

    });

    test("not throws exception if cookieConfig.data and name present", () => {

        let cookieConfig = {
            name: "dummy_name",
            data: "dummy_data"
        }

        cookieUtility.newCookie(cookieConfig);
    });

});

describe("getCookie function", () => {

    afterEach(() => {
        clearAllCookies()
    });

    test("retrieves the requested cookie if it exists", () => {

        let cookieConfig = {
            name: "dummy_name",
            data: "dummy_data",
            cookieParams: {},
            cookieFlags: []
        }

        cookieUtility.newCookie(cookieConfig);

        expect(cookieUtility.getCookie("dummy_name")).toEqual(cookieConfig);
    });

    test("return null if cookie does not exits", () => {

        expect(cookieUtility.getCookie("dummy_name")).toEqual(null);

    });

});

describe("cookieExists function", () => {

    afterEach(() => {
        clearAllCookies()
    });

    test("return true if the cookie exists", () => {

        let cookieConfig = {
            name: "dummy_name",
            data: "dummy_data",
            cookieParams: {},
            cookieFlags: []
        }

        cookieUtility.newCookie(cookieConfig);

        expect(cookieUtility.cookieExists("dummy_name")).toEqual(true);
    });

    test("return false if the cookie does not exists", () => {

        expect(cookieUtility.cookieExists("dummy_name")).toEqual(false);

    });

});

describe("objectToCookie function", () => {

    test("return valid cookie structure", () => {

        let date = new Date();
        date.setTime(date.getTime() + (10 * 24 * 60 * 60 * 1000));

        let cookieConfig = {
            name: "dummy_name",
            data: "dummy_data",
            cookieParams: {
                expires: date.toUTCString(),
                path: '/'
            },
            cookieFlags: [
                "secure"
            ]
        }

        let cookieString = "dummy_name=dummy_data;expires=" + date.toUTCString() + ";path=/;secure"

        expect(cookieUtility.objectToCookie(cookieConfig)).toEqual(cookieString);
    });

});

describe("cookieToObject function", () => {

    test("return valid object", () => {

        let date = new Date();
        date.setTime(date.getTime() + (10 * 24 * 60 * 60 * 1000));

        let cookieString = "dummy_name=dummy_data;expires=" + date.toUTCString() + ";path=/;secure"

        let cookieConfig = {
            name: "dummy_name",
            data: "dummy_data",
            cookieParams: {
                expires: date.toUTCString(),
                path: '/'
            },
            cookieFlags: [
                "secure"
            ]
        }

        expect(cookieUtility.cookieToObject(cookieString)).toEqual(cookieConfig);
    });

    test("return null if the cookieString is invalid", () => {

        let cookieString = null;

        expect(cookieUtility.cookieToObject(cookieString)).toEqual(null);
    });

});