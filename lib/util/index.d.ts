import { StoryKind } from "@storybook/addons";
export declare type Story = {
    kind: string;
    story: string;
};
export declare type Task<T, S> = (runner: S) => Promise<T>;
export declare function sleep(time?: number): Promise<{}>;
export declare function flattenStories(stories: StoryKind[]): Story[];
export declare function filterStories(flatStories: Story[], include: string[], exclude: string[]): {
    kind: string;
    story: string;
}[];
export declare const execParalell: <T, S>(tasks: Task<T, S>[], runners: S[]) => Promise<T[]>;
export declare const sanitize: (string: string) => string;
export declare const toId: (kind: string, name: string) => string;
