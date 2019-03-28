"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
class Logger {
    constructor(level = "normal") {
        this.level = level;
        this.color = new chalk_1.default.constructor({ level: 1 });
    }
    debug(...msg) {
        if (this.level !== "verbose")
            return;
        // tslint:disable-next-line: no-console
        console.log.apply(console, [this.color.gray("debug"), ...msg]);
    }
    log(...msg) {
        if (this.level === "silent")
            return;
        // tslint:disable-next-line: no-console
        console.log.apply(console, [this.color.cyan("info"), ...msg]);
    }
    warn(...msg) {
        if (this.level === "silent")
            return;
        // tslint:disable-next-line: no-console
        console.error.apply(console, [this.color.yellow("warn"), ...msg]);
    }
    error(...msg) {
        if (this.level === "silent")
            return;
        // tslint:disable-next-line: no-console
        console.error.apply(console, [this.color.red("error"), ...msg]);
    }
    errorStack(stack) {
        if (this.level === "silent")
            return;
        // tslint:disable-next-line: no-console
        console.error(stack);
    }
    write(d) {
        if (this.level === "silent")
            return;
        process.stdout.write(d);
    }
    tick() {
        if (this.level === "silent")
            return;
        process.stdout.write(".");
    }
}
exports.Logger = Logger;
