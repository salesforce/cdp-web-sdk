/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {baseConfiguration} from '@app/models/baseConfiguration';
import Logger from "@app/logs/Logger";
import {eventClientConfig} from "@app/settings/Constants"

const LOGGER_NAME = "Configuration.js";

export default class Configuration {

    constructor(config, identity) {
        this.identity = identity;
        this.setConfiguration(config);
    }

    // Returns the serialized version of the configuration object
    // TODO: It has problem serializing async functions
    toJSON() {
        return JSON.stringify(
            this.configuration,
            function(key, val) {
                return (typeof val === 'function') ? val.toString() : val;
            }
        );
    }

    getIdentity() {
        return this.identity;
    }

    getClient() {
        return this.configuration.client;
    }

    getSchemas() {
        return this.configuration.schemas;
    }

    getTransforms() {
        return this.configuration.transforms;
    }

    getDataProviders() {
        return this.configuration.dataProviders;
    }

    getSignals() {
        return this.configuration.signals;
    }

    getConditions() {
        return this.configuration.conditions;
    }

    getSelectors() {
        return this.configuration.selectors;
    }

    // It will replace all the configuration with the value provided
    // use register for partial set
    setConfiguration(config) {
        this._validateConfig(config);
        this.configuration = Object.assign(baseConfiguration, config);
        this._assignDeviceIdSessionId(config);
        this._assignRetryConfig(config);
        this._assignConsentEventTypeName(config);
        this._assignConsentEventCategoryName(config);
        Logger.info(LOGGER_NAME, `Successfully set the web SDK configuration.`);
    }

    // For partial config set/update of [client, schemas, transforms, dataProviders, conditions].
    // Use setConfiguration for full update.
    // It will fully replace the signals with the provided value
    register(config) {
        this._validateConfig(config);

        Object.keys(config).forEach(item => {
            if ('signals' === item) {
                this.configuration.signals = config.signals;
            } else {
                Object.assign(this.configuration[item], config[item]);
            }
        });

        this._assignDeviceIdSessionId(config);
    }

    _assignConsentEventTypeName(config) {
        if (config && 'client' in config && config.client.consentEventTypeName) {
            this.configuration.client.consentEventTypeName = config.client.consentEventTypeName;
        } else {
            this.configuration.client.consentEventTypeName = eventClientConfig.CONSENT_EVENT_TYPE_NAME;
        }
    }

    _assignConsentEventCategoryName(config) {
        if (config && 'client' in config && config.client.consentEventCategoryName) {
            this.configuration.client.consentEventCategoryName = config.client.consentEventCategoryName;
        } else {
            this.configuration.client.consentEventCategoryName = eventClientConfig.CONSENT_EVENT_CATEGORY_NAME;
        }
    }

    _assignDeviceIdSessionId(config) {
        this.configuration.client.sessionId = this.identity.getCustomerIdentity();
        this.configuration.client.deviceId = this.configuration.client.sessionId;
        if (config && 'client' in config && config.client.deviceId) {
            this.configuration.client.sessionId = config.client.deviceId;
            this.configuration.client.deviceId = config.client.deviceId;
        }
    }

    _assignRetryConfig(config) {
        if (config && 'client' in config && config.client.retryAttempts) {
            this.configuration.client.retryAttempts = config.client.retryAttempts;
        } else {
            this.configuration.client.retryAttempts = eventClientConfig.REQUEST_RETRY_ATTEMPTS;
        }

        if(config && 'client' in config && config.client.retryDelayMS) {
            this.configuration.client.retryDelayMS = config.client.retryDelayMS;
        } else {
            this.configuration.client.retryDelayMS = eventClientConfig.REQUEST_RETRY_DELAY_MS;
        }
    }

    _validateConfig(config) {
        this._validateObjectAttribute(config, 'client');
        this._validateObjectAttribute(config, 'schemas');
        this._validateObjectAttribute(config, 'transforms');
        this._validateObjectAttribute(config, 'dataProviders');
        this._validateObjectAttribute(config, 'conditions');
        this._validateObjectAttribute(config, 'selectors');
        this._validateArrayAttribute(config, 'signals');
        this._validateNotSupportedAttributes(config);
    }

    _validateObjectAttribute(config, attribute) {
        if (attribute in config && typeof config[attribute] !== "object") {
            Logger.error(LOGGER_NAME, `${attribute} attribute must be an object`);
            throw new Error(attribute + ' attribute must be an object');
        }
    }

    _validateArrayAttribute(config, attribute) {
        if (attribute in config && !Array.isArray(config[attribute])) {
            Logger.error(LOGGER_NAME, `${attribute} attribute must be an array`);
            throw new Error(attribute + ' attribute must be an array');
        }
    }

    _validateNotSupportedAttributes(config) {
        if (!Object.keys(config).every(item => baseConfiguration.hasOwnProperty(item))) {
            Logger.error(LOGGER_NAME, `Not supported attribute in the configuration.`);
            throw new Error('Supported attributes in configuration are [client, schemas, transforms, dataProviders, signals, conditions, selectors]');
        }
    }
}
