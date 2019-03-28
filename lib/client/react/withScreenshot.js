"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const capture_1 = require("../capture");
class ScreenshotDecorator extends react_1.default.Component {
    componentWillMount() {
        capture_1.stock(this.props.screenshotOptions);
    }
    componentDidMount() {
        capture_1.capture();
    }
    render() {
        return (react_1.default.createElement(react_1.Fragment, null, this.props.children));
    }
}
function withScreenshot(opt = {}) {
    return (storyFn, ctx) => {
        const wrapperWithContext = (context) => {
            const props = {
                screenshotOptions: opt,
            };
            return react_1.default.createElement(ScreenshotDecorator, Object.assign({}, props), storyFn(context));
        };
        if (ctx) {
            return wrapperWithContext(ctx);
        }
        return (context) => wrapperWithContext(context);
    };
}
exports.withScreenshot = withScreenshot;
