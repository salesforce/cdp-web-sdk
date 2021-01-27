/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

"use strict";

import EventClient from '@app/client/EventClient';
import Configuration from "@app/client/Configuration";
import Engine from "@app/engine/engine"
import Logger from "@app/logs/Logger";
import Identity from "@app/identity/Identity";
import Authenticator from "@app/authentication/Authenticator";
import Consent from '@app/consent/Consent';

let client;
let configuration;
let identity;
let authenticator;
let consent;
let engine;

function configure(config) {
    if (!navigator.cookieEnabled) {
        console.error("The browser does not support or is blocking cookies from being set.");
        throw new Error();
    }

    if (config && 'client' in config) {
        identity = new Identity();
        configuration = new Configuration(config, identity);
        authenticator = new Authenticator(configuration);
        consent = new Consent(configuration.getIdentity());
        client = new EventClient(configuration, authenticator, consent);
        if (!engine) {
            engine = new Engine(client, configuration);
        }
    } else {
        configuration.register(config);
    }

    if (engine) {
        return engine.createEngine({client, configuration, global});
    } else {
        console.error("No CDP engine instance found.");
        throw new Error();
    }
}

function sendEvent(eventCategory, eventName, eventObject) {
    client.sendEvent(eventCategory, eventName, eventObject);
}

function consentOptIn() {
    client.consentOptIn();
}

function consentOptOut() {
    client.consentOptOut();
}

function getUrlParam(param) {
    return new URLSearchParams(location.search).get(param);
}

function getConfiguration() {
    return configuration;
}

function setLogLevel(level) {
    Logger.setLogLevel(level);
}

export {
    sendEvent,
    getUrlParam,
    consentOptIn,
    consentOptOut,
    getConfiguration,
    setLogLevel,
    configure
};
