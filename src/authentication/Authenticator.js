/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

"use strict";

export default class Authenticator {

    constructor(configuration) {
        this.config = configuration;
    }

    authenticate() {
        return this._authenticateWithRetry();
    }

    _authenticateWithRetry(retries = this.config.getClient().retryAttempts) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.withCredentials = true;
            let constBody = {
                "appSourceId": this.config.getClient().appSourceId,
                "deviceId": this.config.getClient().deviceId
            };
            xhr.open('POST', this.config.getClient().authEndpoint);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    if(retries > 0) {
                        setTimeout(() => {
                            resolve(this._authenticateWithRetry(retries - 1));
                        }, this.config.getClient().retryDelay);
                    } else {
                        reject(xhr.status);
                    }
                }
            };
            xhr.onerror = () => {
                if(retries > 0) {
                    setTimeout(() => {
                        resolve(this._authenticateWithRetry(retries - 1));
                    }, this.config.getClient().retryDelay);
                } else {
                    reject(xhr.status);
                }
                reject(xhr.status);
            };

            xhr.send("auth=" + btoa(JSON.stringify(constBody)));
        });
    }
}
