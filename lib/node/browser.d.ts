/// <reference types="node" />
import { StoryKind } from "@storybook/addons";
import { Page } from "puppeteer";
import { MainOptions, ZisuiRunMode } from "./types";
import { Story } from "../util";
export declare class Browser {
    protected opt: MainOptions;
    private browser;
    protected page: Page;
    constructor(opt: MainOptions);
    boot(): Promise<this>;
    protected openPage(url: string): Promise<void>;
    close(): Promise<void>;
}
export declare class StorybookBrowser extends Browser {
    getStories(): Promise<{
        stories: StoryKind[];
        managed: boolean | undefined;
    }>;
}
export declare class PreviewBrowser extends Browser {
    private mode;
    private idx;
    failedStories: (Story & {
        count: number;
    })[];
    private viewport?;
    private emitter;
    private currentStory?;
    private processStartTime;
    private processedStories;
    constructor(mainOptions: MainOptions, mode: ZisuiRunMode, idx: number);
    private debug;
    boot(): Promise<this>;
    private addStyles;
    private expose;
    private handleOnCapture;
    private waitScreenShotOption;
    private setViewport;
    private waitBrowserMetricsStable;
    screenshot(): Promise<{
        buffer: null;
        elapsedTime: number;
        kind: string;
        story: string;
        count: number;
    } | {
        buffer: null;
        elapsedTime: number;
    } | {
        buffer: Buffer;
        elapsedTime: number;
    } | {
        buffer: Buffer;
        elapsedTime: number;
        kind: string;
        story: string;
        count: number;
    }>;
    setCurrentStory(kind: string, story: string, count: number): Promise<void>;
}
