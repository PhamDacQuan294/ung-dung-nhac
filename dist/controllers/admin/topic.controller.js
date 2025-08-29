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
exports.detail = exports.editPatch = exports.edit = exports.createPost = exports.create = exports.deleteItem = exports.changeMulti = exports.changeStatus = exports.index = void 0;
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const filterStatus_1 = require("../../helpers/filterStatus");
const search_1 = require("../../helpers/search");
const pagination_1 = require("../../helpers/pagination");
const config_1 = require("../../config/config");
const account_model_1 = __importDefault(require("../../models/account.model"));
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
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
        const sortKey = String(req.query.sortKey);
        const sortValue = req.query.sortValue === "desc" ? -1 : 1;
        sort[sortKey] = sortValue;
    }
    else {
        sort["position"] = -1;
    }
    const topics = yield topic_model_1.default.find(find)
        .sort(sort)
        .limit(buildPagination.limitItems)
        .skip(buildPagination.skip);
    for (const topic of topics) {
        const user = yield account_model_1.default.findOne({
            _id: topic.createdBy.account_id
        });
        if (user) {
            topic["accountFullName"] = user.fullName;
        }
        const updatedBy = topic.updatedBy.slice(-1)[0];
        if (updatedBy) {
            const userUpdated = yield account_model_1.default.findOne({
                _id: updatedBy.account_id
            });
            updatedBy["accountFullName"] = userUpdated.fullName;
        }
    }
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
    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    };
    yield topic_model_1.default.updateOne({
        _id: id
    }, {
        status: status,
        $push: { updatedBy: updatedBy }
    });
    req.flash("success", "Cập nhật trạng thái thành công!");
    res.redirect(redirectUrl);
});
exports.changeStatus = changeStatus;
const changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const redirectUrl = req.query.redirect;
    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    };
    switch (type) {
        case "active":
            yield topic_model_1.default.updateMany({ _id: { $in: ids } }, {
                status: "active",
                $push: { updatedBy: updatedBy }
            });
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} chủ đề!`);
            break;
        case "inactive":
            yield topic_model_1.default.updateMany({ _id: { $in: ids } }, {
                status: "inactive",
                $push: { updatedBy: updatedBy }
            });
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} chủ đề!`);
            break;
        case "delete-all":
            yield topic_model_1.default.updateMany({ _id: { $in: ids } }, {
                deleted: true,
                deletedBy: {
                    account_id: res.locals.user.id,
                    deletedAt: new Date()
                }
            });
            req.flash("success", `Đã xoá thành công ${ids.length} chủ đề!`);
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);
                yield topic_model_1.default.updateOne({ _id: id }, {
                    position: position,
                    $push: { updatedBy: updatedBy }
                });
            }
            req.flash("success", `Thay đổi vị trí thành công ${ids.length} chủ đề!`);
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
        deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date()
        }
    });
    req.flash("success", `Đã xoá thành công sản phẩm!`);
    res.redirect(redirectUrl);
});
exports.deleteItem = deleteItem;
const create = (req, res) => {
    res.render("admin/pages/topics/create", {
        pageTitle: "Thêm mới chủ đề"
    });
};
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let avatar = "";
    if (req.body.avatar) {
        avatar = req.body.avatar;
    }
    if (req.body.position == "") {
        const countTopics = yield topic_model_1.default.countDocuments();
        req.body.position = countTopics + 1;
    }
    else {
        req.body.position = parseInt(req.body.position);
    }
    const createdBy = {
        account_id: res.locals.user.id
    };
    const dataTopic = {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        avatar: avatar,
        position: req.body.position,
        createdBy: createdBy
    };
    const topic = new topic_model_1.default(dataTopic);
    yield topic.save();
    res.redirect(`/${config_1.systemConfig.prefixAdmin}/topics`);
});
exports.createPost = createPost;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };
        const topic = yield topic_model_1.default.findOne(find);
        res.render("admin/pages/topics/edit", {
            pageTitle: "Chỉnh sửa chủ đề",
            topic: topic,
        });
    }
    catch (error) {
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const dataTopic = {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        position: req.body.position
    };
    if (req.body.avatar) {
        dataTopic["avatar"] = req.body.avatar;
    }
    try {
        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        };
        yield topic_model_1.default.updateOne({ _id: id }, Object.assign(Object.assign({}, dataTopic), { $push: { updatedBy: updatedBy } }));
        req.flash("success", `Cập nhật thành công sản phẩm!`);
    }
    catch (error) {
        req.flash("success", `Cập nhật chưa thành công sản phẩm!`);
    }
    res.redirect(`/${config_1.systemConfig.prefixAdmin}/topics/edit/${id}`);
});
exports.editPatch = editPatch;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };
        const topic = yield topic_model_1.default.findOne(find);
        res.render("admin/pages/topics/detail", {
            pageTitle: topic.title,
            topic: topic
        });
    }
    catch (error) {
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.detail = detail;
