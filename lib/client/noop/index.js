"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noopDecorator = () => (storyFn, ctx) => ctx != null ? storyFn(ctx) : storyFn;
