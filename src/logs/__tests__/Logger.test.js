/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {describe, jest, test} from "@jest/globals";
import Logger from "@app/logs/Logger";
import {cookieUtility} from "@app/cookies/cookieUtility";

describe("Logger test Levels", () => {

    test("if level=none, it show not show any log", () => {

        Logger.setLogLevel("none");

        console.info = jest.fn();
        console.warn = jest.fn();
        console.error = jest.fn();

        Logger.info("info");
        Logger.error("error");
        Logger.warn("warn");

        expect(console.info).toHaveBeenCalledTimes(0);
        expect(console.warn).toHaveBeenCalledTimes(0);
        expect(console.error).toHaveBeenCalledTimes(0);
    });

    test("if level=error, it shows only error logs", () => {

        Logger.setLogLevel("error");

        console.info = jest.fn();
        console.warn = jest.fn();
        console.error = jest.fn();

        Logger.info("info");
        Logger.error("error");
        Logger.warn("warn");

        expect(console.info).toHaveBeenCalledTimes(0);
        expect(console.warn).toHaveBeenCalledTimes(0);
        expect(console.error).toHaveBeenCalledTimes(1);
    });

    test("if level=debug, it shows only error and warning logs", () => {

        Logger.setLogLevel("debug");

        console.info = jest.fn();
        console.warn = jest.fn();
        console.error = jest.fn();

        Logger.info("info");
        Logger.error("error");
        Logger.warn("warn");

        expect(console.info).toHaveBeenCalledTimes(0);
        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledTimes(1);
    });

    test("if level=all, it shows logs in all levels", () => {

        Logger.setLogLevel("all");

        console.info = jest.fn();
        console.warn = jest.fn();
        console.error = jest.fn();

        Logger.info("info");
        Logger.error("error");
        Logger.warn("warn");

        expect(console.info).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledTimes(1);
    });

    test("if level set to in correct value, use the previous or default log level", () => {

        Logger.setLogLevel("none"); // default log level
        Logger.setLogLevel("dummy");

        console.info = jest.fn();
        console.warn = jest.fn();
        console.error = jest.fn();

        Logger.info("info");
        Logger.error("error");
        Logger.warn("warn");

        expect(console.info).toHaveBeenCalledTimes(0);
        expect(console.warn).toHaveBeenCalledTimes(0);
        expect(console.error).toHaveBeenCalledTimes(0);
    });

});