/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {cookieUtility} from "@app/cookies/cookieUtility";
import {identityConfig} from '@app/settings/Constants';
import {uuid} from "@app/uuid/Uuid";

export default class Identity {

    getCustomerIdentity() {
        if (cookieUtility.cookieExists(identityConfig.UUID_NAME)) {
            this.customerId = cookieUtility.getCookie(identityConfig.UUID_NAME).data;
            return this.customerId;
        } else {
            this.customerId = uuid.v4();
            return this.customerId;
        }
    }

    setCustomerIdentityCookie() {
        let date = new Date();
        date.setTime(date.getTime() + (identityConfig.UUID_EXP_DAYS * 24 * 60 * 60 * 1000));

        let cookieConfig = {
            name: identityConfig.UUID_NAME,
            data: this.customerId,
            cookieParams: {
                expires: date.toUTCString(),
                path: '/'
            }
        }

        cookieUtility.newCookie(cookieConfig);
    }
}



