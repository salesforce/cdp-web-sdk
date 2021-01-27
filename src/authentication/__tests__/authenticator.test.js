/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import Authenticator from '@app/authentication/Authenticator';
import Configuration from "@app/client/Configuration";
import {afterAll, describe, jest, test} from "@jest/globals";

jest.mock("@app/client/Configuration");

let clientConfig = {
    client: {
        "appSourceId": "test123",
        "deviceId": "testdevice",
        "beaconEndpoint": "https://server.internal:8881/event",
        "authEndpoint": "https://server.internal:8881/auth",
        "sessionId": "sessionId"
    }
}

afterAll(() => {
    Configuration.mockClear();
});

describe("Authenticator", () => {

    test("can be run", () => { // TODO: need to have better test
        const configuration = new Configuration(clientConfig);
        const authenticator = new Authenticator(configuration);
        Configuration.mock.instances[0].getClient = jest.fn(() => clientConfig.client);

        authenticator.authenticate().catch(() => {});
    });

});
