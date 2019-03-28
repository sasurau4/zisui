"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const url_1 = require("url");
const querystring_1 = __importDefault(require("querystring"));
const puppeteer_1 = require("puppeteer");
const errors_1 = require("./errors");
const util_1 = require("../util");
const default_screenshot_options_1 = require("../client/default-screenshot-options");
const dd = require("puppeteer/DeviceDescriptors");
function url2story(url) {
    const q = url_1.parse(url).query || "";
    const { selectedKind: kind, selectedStory: story } = querystring_1.default.parse(q);
    if (!kind || Array.isArray(kind) || !story || Array.isArray(story))
        return;
    return { kind, story };
}
class MetricsWatcher {
    constructor(page, count) {
        this.page = page;
        this.count = count;
        this.length = 3;
        this.previous = [];
    }
    waitForStable() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = this.count; i > 0; --i) {
                if (yield this.check())
                    return i;
                yield util_1.sleep(20);
            }
            return 0;
        });
    }
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            const current = yield this.page.metrics();
            if (this.previous.length < this.length)
                return this.next(current);
            if (this.diff("Nodes"))
                return this.next(current);
            if (this.diff("RecalcStyleCount"))
                return this.next(current);
            if (this.diff("LayoutCount"))
                return this.next(current);
            return true;
        });
    }
    diff(k) {
        for (let i = 1; i < this.previous.length; ++i) {
            if (this.previous[i][k] !== this.previous[0][k])
                return true;
        }
        return false;
    }
    next(m) {
        this.previous.push(m);
        this.previous = this.previous.slice(-this.length);
        return false;
    }
}
class Browser {
    constructor(opt) {
        this.opt = opt;
    }
    boot() {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser = yield puppeteer_1.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"], headless: !this.opt.showBrowser });
            this.page = yield this.browser.newPage();
            return this;
        });
    }
    openPage(url) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.goto(url);
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.page.close();
                yield util_1.sleep(50);
                yield this.browser.close();
            }
            catch (e) {
                // nothing to do
            }
        });
    }
}
exports.Browser = Browser;
class StorybookBrowser extends Browser {
    getStories() {
        return __awaiter(this, void 0, void 0, function* () {
            this.opt.logger.debug("Wait for stories definition.");
            yield this.openPage(this.opt.storybookUrl);
            const registered = yield this.page.evaluate(() => window.__ZISUI_REGISTERED__);
            let stories;
            if (registered) {
                stories = (yield this.page.waitFor(() => window.stories).then(x => x.jsonValue()));
            }
            else {
                yield this.page.goto(this.opt.storybookUrl + "/iframe.html?selectedKind=zisui&selectedStory=zisui");
                yield this.page.waitFor(() => window.__STORYBOOK_CLIENT_API__);
                stories = yield this.page.evaluate(() => window.__STORYBOOK_CLIENT_API__.getStorybook().map(({ kind, stories }) => ({ kind, stories: stories.map(s => s.name) })));
            }
            this.opt.logger.debug(stories);
            this.opt.logger.log(`Found ${this.opt.logger.color.green(util_1.flattenStories(stories).length + "")} stories.`);
            return { stories, managed: registered };
        });
    }
}
exports.StorybookBrowser = StorybookBrowser;
class PreviewBrowser extends Browser {
    constructor(mainOptions, mode, idx) {
        super(mainOptions);
        this.mode = mode;
        this.idx = idx;
        this.failedStories = [];
        this.processStartTime = 0;
        this.processedStories = {};
        this.emitter = new events_1.EventEmitter();
        this.emitter.on("error", e => {
            throw e;
        });
    }
    debug(...args) {
        this.opt.logger.debug.apply(this.opt.logger, [`[cid: ${this.idx}]`, ...args]);
    }
    boot() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield _super("boot").call(this);
            yield this.expose();
            yield this.addStyles();
            yield this.openPage(this.opt.storybookUrl + "/iframe.html?selectedKind=zisui&selectedStory=zisui");
            yield this.addStyles();
            return this;
        });
    }
    addStyles() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.opt.disableCssAnimation) {
                yield this.page.addStyleTag({
                    content: `
*, *::before, *::after {
  transition: none !important;
  animation: none !important;
}
        `,
                });
                yield this.page.addScriptTag({
                    content: `
const $doc = document;
const $style = $doc.createElement('style');
$style.innerHTML = "body *, body *::before, body *::after { transition: none !important; animation: none !important; caret-color: transparent !important; }";
$doc.body.appendChild($style);
        `
                });
            }
        });
    }
    expose() {
        return __awaiter(this, void 0, void 0, function* () {
            this.page.exposeFunction("emitCatpture", (opt) => this.handleOnCapture(opt));
            this.page.exposeFunction("getCurrentStory", (url) => url2story(url));
        });
    }
    handleOnCapture(opt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.currentStory) {
                this.emitter.emit("error", new errors_1.InvalidCurrentStoryStateError());
                return;
            }
            if (this.processedStories[this.currentStory.kind + this.currentStory.story]) {
                this.debug("This story was already processed:", this.currentStory.kind, this.currentStory.story, JSON.stringify(opt));
                return;
            }
            this.processedStories[this.currentStory.kind + this.currentStory.story] = this.currentStory;
            this.debug("Start to process to screenshot story:", this.currentStory.kind, this.currentStory.story, JSON.stringify(opt));
            this.emitter.emit("screenshotOptions", opt);
        });
    }
    waitScreenShotOption() {
        return new Promise((resolve, reject) => {
            let id;
            const cb = (opt) => {
                resolve(opt);
                this.emitter.removeAllListeners();
                clearTimeout(id);
            };
            id = setTimeout(() => {
                this.emitter.removeAllListeners();
                if (!this.currentStory) {
                    reject(new errors_1.InvalidCurrentStoryStateError());
                    return;
                }
                if (this.currentStory.count < this.opt.captureMaxRetryCount) {
                    this.opt.logger.warn(`Capture timeout exceeded in ${this.opt.captureTimeout + ""} msec. Retry to screenshot this story after this sequence.`, this.currentStory.kind, this.currentStory.story, this.currentStory.count + 1);
                    this.failedStories.push(Object.assign({}, this.currentStory, { count: this.currentStory.count + 1 }));
                    resolve();
                    return;
                }
                reject(new errors_1.ScreenshotTimeoutError(this.opt.captureTimeout, this.currentStory));
            }, this.opt.captureTimeout);
            this.emitter.once("screenshotOptions", cb);
        });
    }
    setViewport(opt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.currentStory) {
                throw new errors_1.InvalidCurrentStoryStateError();
            }
            let nextViewport;
            if (typeof opt.viewport === "string") {
                if (opt.viewport.match(/^\d+$/)) {
                    nextViewport = { width: +opt.viewport, height: 600 };
                }
                else if (opt.viewport.match(/^\d+x\d+$/)) {
                    const [w, h] = opt.viewport.split("x");
                    nextViewport = { width: +w, height: +h };
                }
                else {
                    const hit = dd.find(d => d.name === opt.viewport);
                    if (!hit) {
                        this.opt.logger.warn(`Skip screenshot for ${this.opt.logger.color.yellow(JSON.stringify(this.currentStory))} because the viewport ${this.opt.logger.color.magenta(opt.viewport)} is not registered in 'puppeteer/DeviceDescriptor'.`);
                        return false;
                    }
                    nextViewport = hit.viewport;
                }
            }
            else {
                nextViewport = opt.viewport;
            }
            if (!this.viewport || JSON.stringify(this.viewport) !== JSON.stringify(nextViewport)) {
                this.debug("Change viewport", JSON.stringify(nextViewport));
                yield this.page.setViewport(nextViewport);
                this.viewport = nextViewport;
                if (this.opt.reloadAfterChangeViewport) {
                    delete this.processedStories[this.currentStory.kind + this.currentStory.story];
                    yield Promise.all([this.page.reload(), this.waitScreenShotOption()]);
                }
                else {
                    yield util_1.sleep(this.opt.viewportDelay);
                }
            }
            return true;
        });
    }
    waitBrowserMetricsStable() {
        return __awaiter(this, void 0, void 0, function* () {
            const mw = new MetricsWatcher(this.page, this.opt.metricsWatchRetryCount);
            const count = yield mw.waitForStable();
            this.debug(`Retry to watch metrics ${this.opt.metricsWatchRetryCount - count} times.`);
            if (count <= 0) {
                this.opt.logger.warn(`Metrics is not stable while ${this.opt.metricsWatchRetryCount} times. ${this.opt.logger.color.yellow(JSON.stringify(this.currentStory))}`);
            }
        });
    }
    screenshot() {
        return __awaiter(this, void 0, void 0, function* () {
            this.processStartTime = Date.now();
            let opt = Object.assign({}, default_screenshot_options_1.defaultScreenshotOptions, { viewport: this.opt.defaultViewport });
            if (this.mode === "managed") {
                opt = yield this.waitScreenShotOption();
                if (!this.currentStory) {
                    throw new errors_1.InvalidCurrentStoryStateError();
                }
                if (!opt || opt.skip) {
                    const elapsedTime = Date.now() - this.processStartTime;
                    return Object.assign({}, this.currentStory, { buffer: null, elapsedTime });
                }
            }
            const succeeded = yield this.setViewport(opt);
            if (!succeeded)
                return Object.assign({}, this.currentStory, { buffer: null, elapsedTime: 0 });
            yield this.waitBrowserMetricsStable();
            yield this.page.evaluate(() => new Promise(res => window.requestIdleCallback(() => res(), { timeout: 300 })));
            const buffer = yield this.page.screenshot({ fullPage: opt ? opt.fullPage : true });
            const elapsedTime = Date.now() - this.processStartTime;
            return Object.assign({}, this.currentStory, { buffer, elapsedTime });
        });
    }
    setCurrentStory(kind, story, count) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentStory = { kind, story, count };
            const storyId = util_1.toId(kind, story);
            const data = {
                key: "storybook-channel",
                event: {
                    type: "setCurrentStory",
                    args: [
                        {
                            storyId
                        },
                    ],
                    from: "zisui",
                }
            };
            this.debug("Set story", kind, story);
            yield this.page.evaluate((d) => window.postMessage(JSON.stringify(d), "*"), data);
        });
    }
}
exports.PreviewBrowser = PreviewBrowser;
