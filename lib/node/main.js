"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("./browser");
const util_1 = require("../util");
const server_1 = require("./server");
const file_1 = require("./file");
function bootPreviewBrowsers(opt, stories, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const browsers = new Array(Math.min(opt.parallel, stories.length)).fill("").map((_, i) => new browser_1.PreviewBrowser(opt, mode, i));
        yield browsers[0].boot();
        yield Promise.all(browsers.slice(1, browsers.length).map(b => b.boot()));
        opt.logger.debug(`Started ${browsers.length} preview browsers`);
        return browsers;
    });
}
function main(opt) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = opt.logger;
        const fileSystem = new file_1.FileSystem(opt);
        const storybookServer = new server_1.StorybookServer(opt);
        const storybookBrowser = new browser_1.StorybookBrowser(opt);
        yield storybookServer.launchIfNeeded();
        yield storybookBrowser.boot();
        const result = yield storybookBrowser.getStories();
        const mode = result.managed ? "managed" : "simple";
        let stories = util_1.filterStories(util_1.flattenStories(result.stories), opt.include, opt.exclude).map(s => (Object.assign({}, s, { count: 0 })));
        opt.logger.debug(`zisui runs with ${mode} mode`);
        storybookBrowser.close();
        if (stories.length === 0) {
            opt.logger.warn("There is no matched story. Check your include/exclude options.");
        }
        while (stories.length > 0) {
            const browsers = yield bootPreviewBrowsers(opt, stories, mode);
            const tasks = stories
                .map(({ story, kind, count }) => {
                return (previewBrowser) => __awaiter(this, void 0, void 0, function* () {
                    yield previewBrowser.setCurrentStory(kind, story, count);
                    const { buffer, elapsedTime } = yield previewBrowser.screenshot();
                    if (buffer) {
                        const path = yield fileSystem.save(kind, story, buffer);
                        opt.logger.log(`Screenshot stored: ${opt.logger.color.magenta(path)} in ${elapsedTime + "" || "--"} msec.`);
                    }
                });
            });
            yield util_1.execParalell(tasks, browsers);
            if (opt.showBrowser)
                break;
            yield browsers.map(b => b.close());
            stories = browsers.reduce((acc, b) => [...acc, ...b.failedStories], []);
        }
        if (!opt.showBrowser)
            storybookServer.shutdown();
    });
}
exports.main = main;
