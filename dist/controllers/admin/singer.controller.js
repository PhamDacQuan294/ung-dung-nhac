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
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const filterStatus_1 = require("../../helpers/filterStatus");
const pagination_1 = require("../../helpers/pagination");
const account_model_1 = __importDefault(require("../../models/account.model"));
const search_1 = require("../../helpers/search");
const config_1 = require("../../config/config");
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
    const countSingers = yield singer_model_1.default.countDocuments(find);
    let buildPagination = (0, pagination_1.objectPagination)({
        currentPage: 1,
        limitItems: 2,
        skip: 0
    }, req.query, countSingers);
    const records = yield singer_model_1.default.find(find)
        .limit(buildPagination.limitItems)
        .skip(buildPagination.skip);
    for (const singer of records) {
        const user = yield account_model_1.default.findOne({
            _id: singer.createdBy.account_id
        });
        if (user) {
            singer["accountFullName"] = user.fullName;
        }
        const updatedBy = singer.updatedBy.slice(-1)[0];
        if (updatedBy) {
            const userUpdated = yield account_model_1.default.findOne({
                _id: updatedBy.account_id
            });
            updatedBy["accountFullName"] = userUpdated.fullName;
        }
    }
    res.render("admin/pages/singers/index", {
        pageTitle: "Quản lý ca sĩ",
        records: records,
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
    yield singer_model_1.default.updateOne({
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
            yield singer_model_1.default.updateMany({ _id: { $in: ids } }, {
                status: "active",
                $push: { updatedBy: updatedBy }
            });
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} ca sỹ!`);
            break;
        case "inactive":
            yield singer_model_1.default.updateMany({ _id: { $in: ids } }, {
                status: "inactive",
                $push: { updatedBy: updatedBy }
            });
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} ca sỹ!`);
            break;
        case "delete-all":
            yield singer_model_1.default.updateMany({ _id: { $in: ids } }, {
                deleted: true,
                deletedBy: {
                    account_id: res.locals.user.id,
                    deletedAt: new Date()
                }
            });
            req.flash("success", `Đã xoá thành công ${ids.length} ca sỹ!`);
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
    yield singer_model_1.default.updateOne({ _id: id }, {
        deleted: true,
        deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date()
        }
    });
    req.flash("success", `Đã xoá thành công ca sỹ!`);
    res.redirect(redirectUrl);
});
exports.deleteItem = deleteItem;
const create = (req, res) => {
    res.render("admin/pages/singers/create", {
        pageTitle: "Thêm mới ca sỹ"
    });
};
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let avatar = "";
    if (req.body.avatar) {
        avatar = req.body.avatar;
    }
    const createdBy = {
        account_id: res.locals.user.id
    };
    const dataSinger = {
        title: req.body.title,
        status: req.body.status,
        avatar: avatar,
        createdBy: createdBy
    };
    const singer = new singer_model_1.default(dataSinger);
    yield singer.save();
    res.redirect(`/${config_1.systemConfig.prefixAdmin}/singers`);
});
exports.createPost = createPost;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };
        const singer = yield singer_model_1.default.findOne(find);
        res.render("admin/pages/singers/edit", {
            pageTitle: "Chỉnh sửa ca sỹ",
            singer: singer
        });
    }
    catch (error) {
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/singers`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const dataSinger = {
        fullName: req.body.title,
        status: req.body.status,
    };
    if (req.body.avatar) {
        dataSinger["avatar"] = req.body.avatar;
    }
    try {
        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        };
        yield singer_model_1.default.updateOne({ _id: id }, Object.assign(Object.assign({}, dataSinger), { $push: { updatedBy: updatedBy } }));
        req.flash("success", `Cập nhật thành công ca sỹ!`);
    }
    catch (error) {
        req.flash("success", `Cập nhật chưa thành công ca sỹ!`);
    }
    res.redirect(`/${config_1.systemConfig.prefixAdmin}/singers/edit/${id}`);
});
exports.editPatch = editPatch;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };
        const singer = yield singer_model_1.default.findOne(find);
        res.render("admin/pages/singers/detail", {
            pageTitle: singer.fullName,
            singer: singer
        });
    }
    catch (error) {
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/singers`);
    }
});
exports.detail = detail;
