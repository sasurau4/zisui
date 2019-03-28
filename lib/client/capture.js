"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const imagesloaded_1 = __importDefault(require("imagesloaded"));
const util_1 = require("../util");
const default_screenshot_options_1 = require("./default-screenshot-options");
function waitImages(enabled, selector = "body") {
    if (!enabled)
        return Promise.resolve();
    const elm = document.querySelector(selector);
    if (!elm)
        return Promise.reject();
    return new Promise(res => imagesloaded_1.default(elm, () => res()));
}
function waitUserFunction(waitFor, win) {
    if (!waitFor)
        return Promise.resolve();
    if (typeof waitFor === "string") {
        if (!win.waitFor || typeof win.waitFor !== "function")
            return Promise.resolve();
        return win.waitFor();
    }
    else if (typeof waitFor === "function") {
        return waitFor();
    }
}
function waitNextIdle(win) {
    return new Promise(res => win.requestIdleCallback(() => res(), { timeout: 3000 }));
}
function pushOptions(win, s, opt) {
    if (!s)
        return;
    const { story, kind } = s;
    if (!win.optionStore)
        win.optionStore = {};
    if (!win.optionStore[kind])
        win.optionStore[kind] = {};
    if (!win.optionStore[kind][story])
        win.optionStore[kind][story] = [];
    win.optionStore[kind][story].push(opt);
}
function consumeOptions(win, s) {
    if (!s)
        return null;
    const { story, kind } = s;
    if (!win.optionStore)
        return null;
    if (!win.optionStore[kind])
        return null;
    if (!win.optionStore[kind][story])
        return null;
    const result = win.optionStore[kind][story];
    delete win.optionStore[kind][story];
    return result;
}
function withExpoesdWindow(cb) {
    if (typeof "window" === "undefined")
        return;
    const win = window;
    if (!win.emitCatpture)
        return;
    return cb(win);
}
function stock(opt = {}) {
    withExpoesdWindow(win => {
        win.getCurrentStory(location.href).then(s => pushOptions(win, s, opt));
    });
}
exports.stock = stock;
function capture() {
    withExpoesdWindow(win => {
        win.getCurrentStory(location.href).then(s => {
            if (!s)
                return;
            const options = consumeOptions(win, s);
            if (!options)
                return;
            const scOpt = options.reduce((acc, opt) => (Object.assign({}, acc, opt)), default_screenshot_options_1.defaultScreenshotOptions);
            if (scOpt.skip)
                win.emitCatpture(scOpt);
            Promise.resolve()
                .then(() => waitImages(scOpt.waitImages))
                .then(() => util_1.sleep(scOpt.delay))
                .then(() => waitUserFunction(scOpt.waitFor, win))
                .then(() => waitNextIdle(win))
                .then(() => win.emitCatpture(scOpt));
        });
    });
}
exports.capture = capture;
