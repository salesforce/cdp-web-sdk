/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {afterAll, beforeAll, describe, jest, test} from "@jest/globals";
import Configuration from "@app/client/Configuration";
import Logger from "@app/logs/Logger";
import Identity from "@app/identity/Identity";

jest.mock("@app/identity/Identity");
let identityMock;

beforeAll(() => {
    identityMock = new Identity();
    jest.spyOn(identityMock, 'getCustomerIdentity').mockImplementation(() => {
        return "uuid";
    });
    Logger.setLogLevel('all');
});

afterAll(() => {
    Logger.setLogLevel('none');
});

let config = {
    client: {
        "appSourceId": "test123",
        "deviceId": "testdevice",
        "beaconEndpoint": "https://server.internal:8881/event",
        "authEndpoint": "https://server.internal:8881/auth",
        "sessionId": "sessionId"
    }
}

let transformsConfig = {
    transforms: {
        toUpperCase (value) {
            return value.toUpperCase()
        }
    }
}

let schemasConfig = {
    schemas: {
        "schemaID_1": {
            "schema1": "test1"
        }
    }
}

let conditionsConfig = {
    conditions: {
        isProductPage () {
            return document.querySelector('.product-view') != null
        }
    }
}

let signalsConfig = {
    signals: [{
        name: 'signal name',
        schema: 'schemaId',
        event: {
            type: 'click',
            selector: '.some-class'
        },
        conditions: [
            'isProductPage'
        ],
        mapping: {
            productName: {
                from: 'page',
                selector: '.title'
            }
        }
    }]
}

let providersConfig = {
    dataProviders: {
        async productCatalog (context) {
            return fetchProductData(key);
        }
    }
}

let userIdentity = {
    data: "uuid"
}

describe("Configuration", () => {
    test("toJSON should serialize the client config correctly", () => {
        const configuration = new Configuration(config, identityMock);
        const expected = '{"client":{"appSourceId":"test123","deviceId":"uuid","beaconEndpoint":"https://server.internal:8881/event","authEndpoint":"https://server.internal:8881/auth","sessionId":"uuid","retryAttempts":3,"retryDelayMS":3000,"consentEventTypeName":"consent-log","consentEventCategoryName":"Consent"},"schemas":{},"transforms":{},"dataProviders":{},"conditions":{},"signals":[],"selectors":{}}'
        expect(configuration.toJSON()).toEqual(expected);
    });

    test("getClient should return the client config", () => {
        const configuration = new Configuration(config, identityMock);
        expect(configuration.getClient()).toEqual(config.client);
    });

    test("should throw error if the client config is not object", () => {
        expect(() => {
            const configuration = new Configuration({client: ""});
        }).toThrow("client attribute must be an object");
    });

    test("should throw error if the schemas config is not object", () => {
        expect(() => {
            const configuration = new Configuration({schemas: ""});
        }).toThrow("schemas attribute must be an object");
    });

    test("should throw error if the transforms config is not object", () => {
        expect(() => {
            const configuration = new Configuration({transforms: ""});
        }).toThrow("transforms attribute must be an object");
    });

    test("should throw error if the dataProviders config is not object", () => {
        expect(() => {
            const configuration = new Configuration({dataProviders: ""});
        }).toThrow("dataProviders attribute must be an object");
    });

    test("should throw error if the conditions config is not object", () => {
        expect(() => {
            const configuration = new Configuration({conditions: ""});
        }).toThrow("conditions attribute must be an object");
    });

    test("should throw error if the conditions config is not array", () => {
        expect(() => {
            const configuration = new Configuration({signals: ""});
        }).toThrow("signals attribute must be an array");
    });

    test("should throw error if there is unsupported attribute in the config", () => {
        expect(() => {
            const configuration = new Configuration({unsupportedAttribute: ""});
        }).toThrow("Supported attributes in configuration are [client, schemas, transforms, dataProviders, signals, conditions, selectors]");
    });

    test("register method register the transforms correctly", () => {
        const configuration = new Configuration(config, identityMock);
        configuration.register(transformsConfig);
        expect(configuration.getTransforms()).toEqual(transformsConfig.transforms);
    });

    test("register method register the transforms and update transforms that exists", () => {
        let updatedTransformsConfig = {
            transforms: {
                toUpperCase (value) {
                    return value;
                }
            }
        }

        const configuration = new Configuration(config, identityMock);
        configuration.register(transformsConfig);
        configuration.register(updatedTransformsConfig);
        expect(configuration.getTransforms()).toEqual(updatedTransformsConfig.transforms);
    });

    test("register method register the transforms and add new transforms to existing ones", () => {
        let updatedTransformsConfig = {
            transforms: {
                toLowerCase (value) {
                    return value.toLowerCase()
                }
            }
        }

        const configuration = new Configuration(config, identityMock);
        configuration.register(transformsConfig);
        configuration.register(updatedTransformsConfig);

        expect("toUpperCase" in configuration.getTransforms()).toEqual(true);
        expect("toLowerCase" in configuration.getTransforms()).toEqual(true);
    });

    test("register method register the schemas correctly", () => {
        const configuration = new Configuration(config, identityMock);
        configuration.register(schemasConfig);
        expect(configuration.getSchemas()).toEqual(schemasConfig.schemas);
    });

    test("register method register the schemas and update existing schemas", () => {
        let updatedSchemasConfig = {
            schemas: {
                "schemaID_1": {
                    "schema1": "test2"
                }
            }
        }

        const configuration = new Configuration(config, identityMock);
        configuration.register(schemasConfig);
        configuration.register(updatedSchemasConfig);

        expect(configuration.getSchemas()).toEqual(updatedSchemasConfig.schemas);
    });

    test("register method register the schemas and add new schemas to existing ones", () => {
        let updatedSchemasConfig = {
            schemas: {
                "schemaID_2": {
                    "schema2": "test2"
                }
            }
        }

        const configuration = new Configuration(config, identityMock);
        configuration.register(schemasConfig);
        configuration.register(updatedSchemasConfig);

        expect("schemaID_1" in configuration.getSchemas()).toEqual(true);
        expect("schemaID_1" in configuration.getSchemas()).toEqual(true);
    });

    test("register method register the conditions correctly", () => {
        const configuration = new Configuration(config, identityMock);
        configuration.register(conditionsConfig);
        expect(configuration.getConditions()).toEqual(conditionsConfig.conditions);
    });

    test("register method register the conditions and update existing ones", () => {
        let updatedConditionsConfig = {
            conditions: {
                isProductPage () {
                    return document.querySelector('.product-view2') != null
                }
            }
        }

        const configuration = new Configuration(config, identityMock);
        configuration.register(conditionsConfig);
        configuration.register(updatedConditionsConfig);

        expect(configuration.getConditions()).toEqual(updatedConditionsConfig.conditions);
    });

    test("register method register the conditions and add new conditions to existing ones", () => {
        let updatedConditionsConfig = {
            conditions: {
                isHomePage () {
                    return document.querySelector('.home-page') != null
                }
            }
        }

        const configuration = new Configuration(config, identityMock);
        configuration.register(conditionsConfig);
        configuration.register(updatedConditionsConfig);

        expect("isProductPage" in configuration.getConditions()).toEqual(true);
        expect("isHomePage" in configuration.getConditions()).toEqual(true);
    });

    test("register method register the signals array correctly", () => {
        const configuration = new Configuration(config, identityMock);
        configuration.register(signalsConfig);
        expect(configuration.getSignals()).toEqual(signalsConfig.signals);
    });

    test("register method register the signals array and replace existing ones", () => {
        let newSignalsConfig = {
            signals: [{
                name: 'signal name',
                schema: 'schemaId'
            }]
        }

        const configuration = new Configuration(config, identityMock);
        configuration.register(signalsConfig);
        configuration.register(newSignalsConfig);
        expect(configuration.getSignals()).toEqual(newSignalsConfig.signals);
    });

    test("register method register the data providers correctly", () => {
        const configuration = new Configuration(config, identityMock);
        configuration.register(providersConfig);
        expect(configuration.getDataProviders()).toEqual(providersConfig.dataProviders);
    });

    test("register method register the data providers and update existing ones", () => {
        let updatedDataProviderConfig = {
            dataProviders: {
                async productCatalog (context) {
                    return newFetchProductData(key);
                }
            }
        }

        const configuration = new Configuration(config, identityMock);
        configuration.register(providersConfig);
        configuration.register(updatedDataProviderConfig);

        expect(configuration.getDataProviders()).toEqual(updatedDataProviderConfig.dataProviders);
    });

    test("register method register the data providers and add new conditions to existing ones", () => {
        let updatedDataProviderConfig = {
            dataProviders: {
                async newProductCatalog (context) {
                    return newFetchProductData(key);
                }
            }
        }

        const configuration = new Configuration(config, identityMock);
        configuration.register(providersConfig);
        configuration.register(updatedDataProviderConfig);

        expect("productCatalog" in configuration.getDataProviders()).toEqual(true);
        expect("newProductCatalog" in configuration.getDataProviders()).toEqual(true);
    });
});
