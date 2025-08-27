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
exports.deleteItem = exports.changeMulti = exports.changeStatus = exports.index = void 0;
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const filterStatus_1 = require("../../helpers/filterStatus");
const search_1 = require("../../helpers/search");
const pagination_1 = require("../../helpers/pagination");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const statusFilters = (0, filterStatus_1.filterStatus)(req.query);
    let find = {
        deleted: false
    };
    if (req.query.status) {
        find["status"] = req.query.status;
    }
    const searchObj = (0, search_1.objectSearh)(req.query);
    if (searchObj) {
        find["$or"] = [
            { title: searchObj.keywordRegex },
            { slug: searchObj.stringSlugRegex }
        ];
    }
    const countTopics = yield topic_model_1.default.countDocuments(find);
    let buildPagination = (0, pagination_1.objectPagination)({
        currentPage: 1,
        limitItems: 2,
        skip: 0
    }, req.query, countTopics);
    const topics = yield topic_model_1.default.find(find)
        .sort({ position: "desc" })
        .limit(buildPagination.limitItems)
        .skip(buildPagination.skip);
    res.render("admin/pages/topics/index", {
        pageTitle: "Quản lý chủ đề",
        topics: topics,
        filterStatus: statusFilters,
        keyword: searchObj ? searchObj.keyword : "",
        pagination: buildPagination
    });
});
exports.index = index;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const status = req.params.status;
    const id = req.params.id;
    const redirectUrl = req.query.redirect;
    yield topic_model_1.default.updateOne({
        _id: id
    }, {
        status: status
    });
    res.redirect(redirectUrl);
});
exports.changeStatus = changeStatus;
const changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const redirectUrl = req.query.redirect;
    switch (type) {
        case "active":
            yield topic_model_1.default.updateMany({ _id: { $in: ids } }, { status: "active" });
            break;
        case "inactive":
            yield topic_model_1.default.updateMany({ _id: { $in: ids } }, { status: "inactive" });
            break;
        case "delete-all":
            yield topic_model_1.default.updateMany({ _id: { $in: ids } }, {
                deleted: true,
                deletedAt: new Date()
            });
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);
                yield topic_model_1.default.updateOne({ _id: id }, {
                    position: position
                });
            }
            break;
        default:
            break;
    }
    res.redirect(redirectUrl);
});
exports.changeMulti = changeMulti;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const redirectUrl = req.query.redirect;
    yield topic_model_1.default.updateOne({ _id: id }, {
        deleted: true,
        deletedAt: new Date()
    });
    res.redirect(redirectUrl);
});
exports.deleteItem = deleteItem;
