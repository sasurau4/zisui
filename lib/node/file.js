"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mkdirp = __importStar(require("mkdirp"));
class FileSystem {
    constructor(opt) {
        this.opt = opt;
    }
    save(kind, story, buffer) {
        const name = this.opt.flat ? (kind + "_" + story).replace(/\//g, "_") : kind + "/" + story;
        const filePath = path_1.default.join(this.opt.outDir, name + ".png");
        return new Promise((resolve, reject) => {
            mkdirp.sync(path_1.default.dirname(filePath));
            fs_1.default.writeFile(filePath, buffer, (err) => {
                if (err)
                    reject(err);
                resolve(filePath);
            });
        });
    }
}
exports.FileSystem = FileSystem;
