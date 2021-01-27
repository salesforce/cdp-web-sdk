/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

"use strict";

import {loggerConfig} from '@app/settings/Constants';

const logLevels = ['none', 'error', 'debug', 'all'];

let selectedLevel = loggerConfig.LOG_LEVEL;

function setLogLevel(logLevel) {
    if (!logLevels.includes(logLevel)) {
        console.error('Available log levels: error, debug, all or none');
    } else {
        selectedLevel = logLevel;
        console.info(`Log level set to ${selectedLevel}`)
    }
}

function _log(methodName, logLevel, loggerName, ...args) {
    if (logLevels.indexOf(selectedLevel) < logLevels.indexOf(logLevel)) {
        return
    }

    const dataAndTime = (new Date()).toISOString()
    const templateText = [`[${loggerConfig.APP_NAME}: ${loggerName}]`, dataAndTime, `${methodName.toUpperCase()}: `]

    console[methodName](...templateText, ...args)
}

function _createLogger(methodName, logLevel) {
    return (loggerName, ...args) => {
        _log(methodName, logLevel, loggerName, ...args)
    }
}

const Logger = {
    setLogLevel,
    warn: _createLogger('warn', 'debug'),
    info: _createLogger('info', 'all'),
    error: _createLogger('error', 'error')
}

export default Logger