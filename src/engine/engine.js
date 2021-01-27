/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

"use strict";

import Logger from "@app/logs/Logger";
import {engineConfig} from '@app/settings/Constants';
import {eventClientConfig} from '@app/settings/Constants';

const valueExtractors = {
    page: pageValueExtractor,
    data: dataValueExtractor
}

const LOGGER_NAME = "engine.js"

let unsubscribeCallbacks = [];
let errors = [];

export default class Engine {

    constructor(client, configuration) {}

    createEngine ({ client, configuration, global }) {
        setMutationObserver({ client, configuration, global });
        processSignals({ client, configuration, global });
        return errors;
    }
}

function setMutationObserver({ client, configuration, global }) {

    const mutationCallBack = debounce(function(mutationsList, observer) {
        processSignals({ client, configuration, global })
    }, engineConfig.MUTATION_OBSERVER.DEBOUNCE_TIME_MS)

    // Options for the observer (which mutations to observe)
    const config = engineConfig.MUTATION_OBSERVER.CONFIG;
    const observer = new MutationObserver(mutationCallBack);
    observer.disconnect();
    const mainElement = window.document.querySelector(engineConfig.MUTATION_OBSERVER.SELECTOR);
    observer.observe(mainElement, config);
}

function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        let context = this, args = arguments;
        let later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}

function destroyEngine() {
    unsubscribeCallbacks.forEach(unsubscribeCallback => {
        try {
            unsubscribeCallback()
        } catch (e) {
            Logger.warn(LOGGER_NAME, e);
        }
    })
}

function processSignals({ client, configuration, global }) {
    destroyEngine(); // Unsubscribe previous signals
    _clearErrors();

    const signals = configuration.getSignals();

    unsubscribeCallbacks = []

    signals.forEach(signal => {
        attachSignal({
            signal,
            global,
            client,
            configuration,
            unsubscribeCallbacks
        })
    })
}

function getElements(selectorConfig, configuration, selectorName) {
    if (!selectorConfig) {
        _addError({
            'selector': selectorName,
            'message': 'The implementation not found in selectors'
        });

        return [];
    }

    let elements = [];

    if (typeof selectorConfig.selector === 'function') {
        elements = validateSelector(selectorConfig, configuration, selectorName);
    } else {
        elements = selectorConfig.selector === 'document'
            ? [document]
            : document.querySelectorAll(selectorConfig.selector);

        if ('containsText' in selectorConfig) {
            elements = filterElementsByInnerText(elements, selectorConfig.containsText);
        }
    }

    return elements;
}

function validateSelector(selectorConfig, configuration, selectorName) {
    let elements = [];

    if (Array.isArray(selectorConfig.selector()) ||selectorConfig.selector() instanceof NodeList) {
        selectorConfig.selector().forEach( (element, index) => {
            if (element instanceof HTMLElement) {
                elements.push(element);
            } else {
                _addError({
                    'selector': selectorName,
                    'message': 'Array element with index of ' + index + ' should be HTML element',
                    'element': element
                });
            }
        } );
    } else {
        _addError({
            'selector': selectorName,
            'message': 'should return array'
        });
    }

    return elements;
}

function filterElementsByInnerText(elements, containsText) {
    let filteredElements = [];

    elements.forEach( element => {
        if (element.textContent && element.textContent.toLowerCase().indexOf(containsText.toLowerCase()) > -1 ) {
            filteredElements.push(element);
        }
    });

    return filteredElements;
}

function attachSignal ({ signal, global, client, configuration, unsubscribeCallbacks }) {
    const { document } = global
    const { event } = signal  // TODO: validate signal structure. e.g. using json schema (needs external library)
    const selectors = configuration.getSelectors();

    const elements = getElements(selectors[event.selector], configuration, event.selector);

    // register event handlers for all existing elements on the page
    elements.forEach(element => {
        const handler = createSignalHandler({
            client,
            signal,
            global,
            configuration
        })
        element.addEventListener(event.type, handler)
        unsubscribeCallbacks.push(() => {
            element.removeEventListener(event.type, handler)
        })

        if (isReadyStateChangeHandler(event.type, selectors[event.selector]) && document.readyState === 'complete') {
            handler(event);
        }
    })
}

function createSignalHandler ({ signal, client, global, configuration }) {
    const { mapping, schema, category, name } = signal

    return (domEvent) => {
        const capturedValue = mapping ? Object.keys(mapping).reduce((result, schemaField) => {
            const map = mapping[schemaField]
            const valueExtractor = valueExtractors[map.from]
            result[schemaField] = valueExtractor({
                map,
                global,
                domEvent,
                configuration
            })
            return result
        }, {}) : {};

        if (schema === configuration.getClient().consentEventTypeName) {
            if (name === eventClientConfig.CONSENT_OPT_IN_OBJECT.status) {
                client.consentOptIn();
            }
            if (name === eventClientConfig.CONSENT_OPT_OUT_OBJECT.status) {
                client.consentOptOut();
            }
        }
        else {
            client.sendEvent(category, schema, capturedValue);
        }
    }
}

function pageValueExtractor ({ map, domEvent, global, configuration}) {
    try {
        const { selector, scope } = map
        const root = scope === 'event' ? domEvent.target : global.document
        let match = root.querySelector(selector);
        if (!match) {
            match = root.querySelector(configuration.getSelectors()[selector].selector);
        }
        let value = match ? match.textContent : null
        if (!value) {
            value = match ? match.value : null
        }
        return value;
    } catch (e) {
        Logger.warn(LOGGER_NAME, e);
        return null;
    }
}

function dataValueExtractor ({ map, domEvent, configuration }) {
    try {
        const dataProviders = configuration.getDataProviders();
        const dataProvider = dataProviders[map.provider]
        const data = dataProvider(domEvent)
        return data ? data[map.attribute] : null
    } catch (e) {
        Logger.warn(LOGGER_NAME, e);
        return null;
    }
}

function isReadyStateChangeHandler (type, selector) {
    return type === 'readystatechange' && selector.selector === 'document'
}

function _addError(error) {
    if(errors.indexOf(error) === -1) {
        errors.push(error);
    }
}

function _clearErrors() {
    errors = [];
}