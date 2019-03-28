/// <reference types="react" />
import { StoryKind } from "@storybook/addons";
import { ScreenShotOptions } from "../types";
export declare function withScreenshot(opt?: Partial<ScreenShotOptions>): (storyFn: Function, ctx: StoryKind | undefined) => JSX.Element | ((context: StoryKind) => JSX.Element);
