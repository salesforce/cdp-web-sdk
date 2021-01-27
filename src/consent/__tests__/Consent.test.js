/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {afterAll, beforeAll, describe, test} from "@jest/globals";
import Consent from "@app/consent/Consent";
import Logger from "@app/logs/Logger";
import Identity from "@app/identity/Identity";

jest.mock("@app/identity/Identity");

let identityMock;
let consent;

beforeAll(() => {
    identityMock = new Identity();
    consent = new Consent(identityMock);
    Logger.setLogLevel('all');
});

afterAll(() => {
    Logger.setLogLevel('none');
});

describe("Consent class stores and retrieves a cookie for the opt-in status", () => {
    test("it should return null initially", () => {
        expect(consent.getConsent()).toEqual(null);
    });

    test("grantConsent sets the cookie", () => {
        consent.grantConsent();
        expect(consent.getConsent().data).toEqual("opt_in");
    });

    test("removeConsent removes the cookie", () => {
        consent.removeConsent();
        expect(consent.getConsent()).toEqual(null);
    });
});
