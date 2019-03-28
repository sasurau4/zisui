"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InvalidUrlError extends Error {
    constructor(invalidUrl) {
        super();
        this.name = " InvalidUrlError";
        this.message = `The URL ${invalidUrl} is invalid.`;
    }
}
exports.InvalidUrlError = InvalidUrlError;
class StorybookServerTimeoutError extends Error {
    constructor(msec) {
        super();
        this.name = "ScreenshotTimeoutError";
        this.message = `Storybook server launch timeout exceeded in ${msec} ms.`;
    }
}
exports.StorybookServerTimeoutError = StorybookServerTimeoutError;
class ScreenshotTimeoutError extends Error {
    constructor(msec, target) {
        super();
        this.name = "ScreenshotTimeoutError";
        this.message = `Screenshot timeout exceeded. 'capture' function is not triggerd in ${msec} ms. Target story: ${target.kind}/${target.story}`;
    }
}
exports.ScreenshotTimeoutError = ScreenshotTimeoutError;
class InvalidCurrentStoryStateError extends Error {
    constructor() {
        super();
        this.name = "InvalidCurrentStoryStateError";
        this.message = "Fail to screenshot. The current story is not set.";
    }
}
exports.InvalidCurrentStoryStateError = InvalidCurrentStoryStateError;
