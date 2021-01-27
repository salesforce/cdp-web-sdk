/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {afterAll, beforeEach, describe, jest, test} from "@jest/globals";
import EventClient from '@app/client/EventClient';
import {eventClientConfig} from '@app/settings/Constants';
import Logger from "@app/logs/Logger";
import Configuration from "@app/client/Configuration";
import Authenticator from "@app/authentication/Authenticator";
import Consent from '@app/consent/Consent';

jest.mock("@app/client/Configuration");
jest.mock("@app/authentication/Authenticator");
jest.mock("@app/consent/Consent");

let configurationMock;
let authenticatorMock;
let consentMock;

let config = {
    client: {
        appSourceId: "test123",
        deviceId: "testdevice",
        beaconEndpoint: "https://server.internal:8881/event",
        authEndpoint: "https://server.internal:8881/auth",
        sessionId: "sessionId",
        retryAttempts: 3,
        retryDelayMS: 3000
    }
}

beforeEach(() => {
    Logger.setLogLevel('all');

    configurationMock = new Configuration(config);
    authenticatorMock = new Authenticator(configurationMock);
    consentMock = new Consent(config.client.appSourceId);

    jest.spyOn(configurationMock, 'getClient').mockImplementation(() => {
        return config.client;
    });

    jest.spyOn(authenticatorMock, 'authenticate').mockImplementation(() => {
        return new Promise((resolve, reject) => {
            resolve();
        })
    });

    Configuration.mockClear();
});

afterAll(() => {
    Logger.setLogLevel('none');
});

describe("event client", () => {

    test("uses get for short requests", () => {

        let productData = {
            "brand": "Hatco",
            "colorVariant": "brown",
            "department": "accessories",
            "image_url": "https://www.northerntrailoutfitters.com/on/demandware.static/-/Sites-nto-apparel/default/dw13c4d977/images/large/3040131BF0-0.jpg",
            "name": "Bear Beanie",
            "price": "25.00",
            "productId": "f37116fa-728f-40ed-b525-9aba47743f27",
            "quantity": "1",
            "sku": "3040131BF0",
            "url": "https://www.northerntrailoutfitters.com/default/baby-bear-beanie-3040131BF0.html"
        }

        let request = new EventClient(configurationMock, authenticatorMock, consentMock);
        request.clientIsReady = true;

        jest.spyOn(request.consent, 'getConsent').mockImplementation(() => {
            return {
                data: "opt_in"
            };
        });

        const mockSendGetEvent = jest.fn()
        request._sendGetEvent = mockSendGetEvent;

        request.sendEvent("engagement", "ProductView", productData).then(() => {
            expect(mockSendGetEvent).toHaveBeenCalledTimes(1);
        });
    });

    test("uses post for long requests", () => {

        let productData = {
            "brand": "Nto",
            "colorVariant": "NA",
            "coupon": "NA",
            "department": "Hiking",
            "image_url": "https://www.northerntrailoutfitters.com/dw/image/v2/BDPX_PRD/on/demandware.static/-/Library-Sites-NTO-SFRASharedLibrary/default/dw70ab4ead/images/category/gear-subcategory-bags-200-200.png",
            "name": "Nto Hiking Backpack",
            "price": "117.00",
            "quantity": "1",
            "sku": "728f728f728f",
            "url": "https://www.northerntrailoutfitters.com/default/homepage"
        }

        Object.assign(productData, { productId: "a".repeat(eventClientConfig.MAX_URL_LENGTH) });

        let request = new EventClient(configurationMock, authenticatorMock, consentMock);
        request.clientIsReady = true;
        jest.spyOn(request.consent, 'getConsent').mockImplementation(() => {
            return {
                data: "opt_in"
            };
        });

        const mockSendPostEvent = jest.fn()
        request._sendPostEvent = mockSendPostEvent;

        request.sendEvent("engagement", "ProductView", productData).then(() => {
            expect(mockSendPostEvent).toHaveBeenCalledTimes(1);
        });
    });

    test("does not send event if the consent flag does not exists", () => {
        let request = new EventClient(configurationMock, authenticatorMock, consentMock);
        request.clientIsReady = true;

        jest.spyOn(request.consent, 'getConsent').mockImplementation(() => {
            return {
                data: "opt_out"
            };
        });

        const mockSendGetEvent = jest.fn()
        request._sendGetEvent = mockSendGetEvent;

        request.sendEvent("engagement", "ProductView", {}).then(() => {
            expect(mockSendGetEvent).toHaveBeenCalledTimes(0);
        });
    });

    test( "check the event payload has required fields", () => {
        let productData = {}

        let request = new EventClient(configurationMock, authenticatorMock, consentMock);
        request.clientIsReady = true;

        jest.spyOn(request.consent, 'getConsent').mockImplementation(() => {
            return {
                data: "opt_in"
            };
        });

        jest.spyOn(request, '_sendGetEvent').mockImplementation((requestBody) => {
            let actualBody = JSON.parse(atob(requestBody.split("event=")[1])).events[0];

            expect('deviceId' in actualBody).toEqual(true);
            expect('eventId' in actualBody).toEqual(true);
            expect('sessionId' in actualBody).toEqual(true);
            expect('dateTime' in actualBody).toEqual(true);
            expect('eventType' in actualBody).toEqual(true);
            expect('category' in actualBody).toEqual(true);
        });

        request.sendEvent("engagement", "ProductView", productData);
    });

    test("does not send event if the browser is not compatible", () => {
        let request = new EventClient(configurationMock, authenticatorMock, consentMock);
        request.clientIsReady = false;

        jest.spyOn(request.consent, 'getConsent').mockImplementation(() => {
            return {
                data: "opt_in"
            };
        });

        const mockSendGetEvent = jest.fn()
        request._sendGetEvent = mockSendGetEvent;

        request.sendEvent("engagement", "ProductView", {}).then(() => {
            expect(mockSendGetEvent).toHaveBeenCalledTimes(0);
        });
    });
});
