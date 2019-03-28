"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addons_1 = __importDefault(require("@storybook/addons"));
window.__ZISUI_REGISTERED__ = true;
addons_1.default.register("zisui", api => {
    addons_1.default.getChannel().once("setStories", e => {
        window.stories = e.stories;
    });
});
