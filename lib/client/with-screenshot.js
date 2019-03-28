"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const withScreenshot_1 = require("./react/withScreenshot");
const noop_1 = require("./noop");
const getStorybookEnv = () => window.STORYBOOK_ENV;
const storybookEnv = getStorybookEnv();
let withScreenshot;
exports.withScreenshot = withScreenshot;
if (storybookEnv == null) {
    exports.withScreenshot = withScreenshot = noop_1.noopDecorator;
}
else {
    switch (storybookEnv) {
        case "react":
            exports.withScreenshot = withScreenshot = withScreenshot_1.withScreenshot;
            break;
        default:
            throw new Error(`storybook-chrome-screenshot does not support "${storybookEnv}".`);
    }
}
