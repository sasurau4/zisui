/// <reference types="node" />
import { MainOptions } from "./types";
export declare class FileSystem {
    private opt;
    constructor(opt: MainOptions);
    save(kind: string, story: string, buffer: Buffer): Promise<string>;
}
