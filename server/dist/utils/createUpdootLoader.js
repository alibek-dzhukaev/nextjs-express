"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUpdootLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const Updoot_1 = require("../entities/Updoot");
const createUpdootLoader = () => new dataloader_1.default(async (keys) => {
    const updoots = await Updoot_1.Updoot.findByIds(keys);
    const updootIdsToUpdoot = {};
    updoots.forEach((it) => {
        updootIdsToUpdoot[`${it.userId}|${it.postId}`] = it;
    });
    return keys.map((it) => updootIdsToUpdoot[`${it.userId}|${it.postId}`]);
});
exports.createUpdootLoader = createUpdootLoader;
//# sourceMappingURL=createUpdootLoader.js.map