"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const song_model_1 = __importDefault(require("../../models/song.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const statistic = {
        topic: {
            total: 0,
            active: 0,
            inactive: 0,
        },
        song: {
            total: 0,
            active: 0,
            inactive: 0,
        },
        singer: {
            total: 0,
            active: 0,
            inactive: 0,
        },
        account: {
            total: 0,
            active: 0,
            inactive: 0,
        },
        user: {
            total: 0,
            active: 0,
            inactive: 0,
        }
    };
    statistic.topic.total = yield topic_model_1.default.countDocuments({
        deleted: false
    });
    statistic.topic.active = yield topic_model_1.default.countDocuments({
        status: "active",
        deleted: false
    });
    statistic.topic.inactive = yield topic_model_1.default.countDocuments({
        status: "inactive",
        deleted: false
    });
    statistic.song.total = yield song_model_1.default.countDocuments({
        deleted: false
    });
    statistic.song.active = yield song_model_1.default.countDocuments({
        status: "active",
        deleted: false
    });
    statistic.song.inactive = yield song_model_1.default.countDocuments({
        status: "inactive",
        deleted: false
    });
    res.render("admin/pages/dashboard/index", {
        pageTitle: "Tổng quan",
        statistic: statistic
    });
});
exports.index = index;
