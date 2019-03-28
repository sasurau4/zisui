export declare class InvalidUrlError extends Error {
    name: string;
    constructor(invalidUrl: string);
}
export declare class StorybookServerTimeoutError extends Error {
    name: string;
    constructor(msec: number);
}
export declare class ScreenshotTimeoutError extends Error {
    name: string;
    constructor(msec: number, target: {
        kind?: string;
        story?: string;
    });
}
export declare class InvalidCurrentStoryStateError extends Error {
    name: string;
    constructor();
}
