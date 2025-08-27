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
const convertToSlug_1 = require("../../helpers/convertToSlug");
const filterStatus_1 = require("../../helpers/filterStatus");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const statusFilters = (0, filterStatus_1.filterStatus)(req.query);
    let find = {
        deleted: false
    };
    if (req.query.status) {
        find["status"] = req.query.status;
    }
    let keyword = "";
    if (req.query.keyword) {
        keyword = `${req.query.keyword}`;
        const keywordRegex = new RegExp(keyword, "i");
        const stringSlug = (0, convertToSlug_1.convertToSlug)(keyword);
        const stringSlugRegex = new RegExp(stringSlug, "i");
        find["$or"] = [
            { title: keywordRegex },
            { slug: stringSlugRegex }
        ];
    }
    const topics = yield topic_model_1.default.find(find);
    res.render("admin/pages/topics/index", {
        pageTitle: "Quản lý chủ đề",
        topics: topics,
        filterStatus: statusFilters,
        keyword: keyword
    });
});
exports.index = index;
