/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {afterAll, beforeAll, describe, jest, test} from "@jest/globals";
import Identity from "@app/identity/Identity";
import {cookieUtility} from "@app/cookies/cookieUtility";
import {uuid} from "@app/uuid/Uuid";
import Logger from "@app/logs/Logger";
let identity;

beforeAll(() => {
    identity = new Identity();
    Logger.setLogLevel('all');
});

afterAll(() => {
    Logger.setLogLevel('none');
});

describe("getCustomerIdentity function", () => {
    test("it should return existing user id if cookie exists", () => {

        jest.spyOn(cookieUtility, 'cookieExists').mockImplementation(() => {
            return true;
        });

        jest.spyOn(cookieUtility, 'getCookie').mockImplementation(() => {
            return {
                data: "cookie"
            };
        });

        expect(identity.getCustomerIdentity()).toEqual("cookie");
    });

    test("it should create a new user id if cookie does not exists", () => {

        jest.spyOn(cookieUtility, 'cookieExists').mockImplementation(() => {
            return false;
        });

        jest.spyOn(uuid, 'v4').mockImplementation(() => {
            return "uuid";
        });

        jest.spyOn(cookieUtility, 'getCookie').mockImplementation(() => {
            return {
                data: "uuid"
            }
        });

        jest.spyOn(cookieUtility, 'newCookie').mockImplementation(() => {});

        expect(identity.getCustomerIdentity()).toEqual("uuid");
    });
});
