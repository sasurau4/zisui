/// <reference types="node" />
import { Chalk } from "chalk";
export declare type LogLevel = "verbose" | "silent" | "normal";
export declare class Logger {
    level: LogLevel;
    color: Chalk;
    constructor(level?: LogLevel);
    debug(...msg: any[]): void;
    log(...msg: (string | number | boolean)[]): void;
    warn(...msg: (string | number | boolean)[]): void;
    error(...msg: any[]): void;
    errorStack(stack: any): void;
    write(d: string | Buffer): void;
    tick(): void;
}
