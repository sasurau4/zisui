"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cp = __importStar(require("child_process"));
const waitOn = require("wait-on");
const errors_1 = require("./errors");
function waitServer(url, timeout) {
    if (!url.startsWith("http")) {
        throw new errors_1.InvalidUrlError(url);
    }
    const resource = url.startsWith("https") ? url.replace(/^https/, "https-get") : url.replace(/^http/, "http-get");
    return new Promise((resolve, reject) => {
        waitOn({ resources: [resource], timeout }, (err) => {
            if (err) {
                if (err.message === "Timeout") {
                    return reject(new errors_1.StorybookServerTimeoutError(timeout));
                }
                return reject(err);
            }
            resolve();
        });
    });
}
class StorybookServer {
    constructor(opt) {
        this.opt = opt;
    }
    launchIfNeeded() {
        return __awaiter(this, void 0, void 0, function* () {
            this.opt.logger.log(`Wait for connecting storybook server ${this.opt.logger.color.green(this.opt.storybookUrl)}.`);
            if (this.opt.serverCmd) {
                const [cmd, ...args] = this.opt.serverCmd.split(/\s+/);
                const stdio = this.opt.logger.level === "verbose" ? [0, 1, 2] : [];
                this.proc = cp.spawn(cmd, args, { stdio });
                this.opt.logger.debug("Server process created", this.proc.pid);
            }
            yield waitServer(this.opt.storybookUrl, this.opt.serverTimeout);
            if (this.opt.serverCmd) {
                this.opt.logger.debug("Storybook server started");
            }
            else {
                this.opt.logger.debug("Found Storybook server");
            }
        });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.proc)
                return;
            try {
                this.opt.logger.debug("Shutdown storybook server", this.proc.pid);
                this.proc.kill("SIGINT");
            }
            catch (e) {
                // nothing todo
            }
        });
    }
}
exports.StorybookServer = StorybookServer;
