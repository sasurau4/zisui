import { MainOptions } from "./types";
export declare class StorybookServer {
    private opt;
    private proc?;
    constructor(opt: MainOptions);
    launchIfNeeded(): Promise<void>;
    shutdown(): Promise<void>;
}
