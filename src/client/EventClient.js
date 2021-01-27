/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import generateEventId from '@app/utils/generateEventId';
import {eventClientConfig} from '@app/settings/Constants';
import Logger from "@app/logs/Logger";
import {identityConfig} from '@app/settings/Constants';
import {eventCategories} from "@app/models/eventCategories";

const LOGGER_NAME = "EventClient.js";

export default class EventClient {

    constructor(configuration, authenticator, consent) {
        this.authenticator = authenticator;
        this.configuration = configuration;
        this.consent = consent;
        this.clientIsReady = false;
        this._checkBrowserCompatibility();
    }

    sendEvent(eventCategory, eventType, eventObject) {
        return this._checkClientIsReady(this.configuration.getClient().retryAttempts).then(() => {
            if(this._consentGranted()) {
                const eventUuid = {};
                eventUuid[identityConfig.UUID_NAME] = this.configuration.getClient().sessionId;

                Object.assign(eventObject, eventUuid);

                let eventBody = Object.assign(this._buildBaseEvent(eventCategory, eventType), eventObject);
                let eventPayload = {
                    "events": [
                        eventBody
                    ]
                };

                let eventParam = eventClientConfig.EVENT_PARAM_NAME + "=" + btoa(JSON.stringify(eventPayload)); //base64encode
                let eventFullUrl = this.configuration.getClient().beaconEndpoint + "?" + eventParam;

                if (eventFullUrl.length > eventClientConfig.MAX_URL_LENGTH) {
                    Logger.info(LOGGER_NAME,`Sending Post request for event: ${JSON.stringify(eventBody)}`);
                    this._sendPostEvent(eventParam);
                } else {
                    Logger.info(LOGGER_NAME, `Sending Get request for event: ${JSON.stringify(eventBody)}`);
                    this._sendGetEvent(eventParam);
                }
            }
        }).catch(() => {});
    }

    consentOptIn() {
        this._checkClientIsReady(this.configuration.getClient().retryAttempts).then(() => {
            Logger.info(LOGGER_NAME, `Received ${eventCategories.CONSENT} opt-in event`);
            this.sendEvent(this.configuration.getClient().consentEventCategoryName, this.configuration.getClient().consentEventTypeName, eventClientConfig.CONSENT_OPT_IN_OBJECT);
            this.consent.grantConsent();
        }).catch();
    }

    consentOptOut() {
        this._checkClientIsReady(this.configuration.getClient().retryAttempts).then(() => {
            Logger.info(LOGGER_NAME, `Received ${eventCategories.CONSENT} opt-out event`);
            this.sendEvent(this.configuration.getClient().consentEventCategoryName, this.configuration.getClient().consentEventTypeName, eventClientConfig.CONSENT_OPT_OUT_OBJECT);
            this.consent.removeConsent();
        }).catch();
    }

    _consentGranted() {
        return this.consent.getConsent() && this.consent.getConsent().data === "opt_in";
    }

    _checkBrowserCompatibility() {
        this.authenticator.authenticate()
            .then(() => {
                this._isAuthConfiguredCorrectly()
                    .then(() => {
                        this.clientIsReady = true;
                        Logger.info(LOGGER_NAME, `Successfully initialized the web SDK.`);
                    })
                    .catch(() => {
                        this.clientIsReady = false;
                        console.warn("The browser does not support or is blocking third party cookies from being set.");
                    })
            }).catch(() => {
            this.clientIsReady = false;
            console.warn("There was a problem calling CDP auth endpoint");
        });
    }

    _checkClientIsReady(retries) {
        return new Promise((resolve, reject) => {
            if (this.clientIsReady) {
                resolve();
            } else {
                if(retries > 0) {
                    setTimeout(() => {
                        resolve(this._checkClientIsReady(retries - 1));
                    }, this.configuration.getClient().retryDelayMS);
                } else{
                    Logger.error(LOGGER_NAME, `Event client is not ready (probably an authentication problem)`);
                    reject('Event client is not ready (probably an authentication problem)');
                }
            }
        });
    }

    _buildBaseEvent(eventCategory, eventType) {
        return {
            deviceId: this.configuration.getClient().deviceId,
            category: eventCategory,
            eventType: eventType,
            dateTime: (new Date()).toISOString(),
            eventId: generateEventId(),
            sessionId: this.configuration.getClient().sessionId
        }
    }

    _sendPostEvent(eventParam) {
        this._request({
            method: 'POST',
            url: this.configuration.getClient().beaconEndpoint,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: eventParam
        }).catch(() => {})
    }

    _sendGetEvent(eventParam) {
        this._request({
            method: 'GET',
            url: this.configuration.getClient().beaconEndpoint + "?" + eventParam
        }).catch(() => {})
    }

    _isAuthConfiguredCorrectly() {
        let eventPayload = {
            "events": []
        };

        let eventParam = eventClientConfig.EVENT_PARAM_NAME + "=" + btoa(JSON.stringify(eventPayload)); //base64encode

        return this._request({
            method: 'GET',
            url: this.configuration.getClient().beaconEndpoint + "?" + eventParam
        }, 1)
    }

    _request(obj, retries = this.configuration.getClient().retryAttempts) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.withCredentials = true;
            xhr.open(obj.method || "GET", obj.url);
            if (obj.headers) {
                Object.keys(obj.headers).forEach(key => {
                    xhr.setRequestHeader(key, obj.headers[key]);
                });
            }
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    if(retries > 0) {
                        setTimeout(() => {
                            if(xhr.status === 401) {
                                this.authenticator.authenticate().catch();
                            }
                            resolve(this._request(obj,retries - 1));
                        }, this.configuration.getClient().retryDelayMS);
                    } else{
                        reject(xhr.status);
                        this.clientIsReady = false;
                        xhr.abort();
                        Logger.error(LOGGER_NAME, `Unable to send request after ${this.configuration.getClient().retryAttempts} attempts`);
                    }

                }
            };
            xhr.onerror = () => {
                if(retries > 0) {
                    setTimeout(() => {
                        resolve(this._request(obj,retries - 1));
                    }, this.configuration.getClient().retryDelayMS);
                } else {
                    reject(xhr.status);
                    this.clientIsReady = false;
                    Logger.error(LOGGER_NAME, `Unable to send request after ${this.configuration.getClient().retryAttempts} attempts`);
                }
            }
            xhr.send(obj.body);
        });
    }

}
