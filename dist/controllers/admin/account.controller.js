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
exports.changeStatus = exports.deleteItem = exports.detail = exports.editPatch = exports.edit = exports.createPost = exports.create = exports.index = void 0;
const account_model_1 = __importDefault(require("../../models/account.model"));
const role_model_1 = __importDefault(require("../../models/role.model"));
const config_1 = require("../../config/config");
const md5_1 = __importDefault(require("md5"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let find = {
        deleted: false
    };
    const records = yield account_model_1.default.find(find).select("-password-token");
    for (const record of records) {
        const role = yield role_model_1.default.findOne({
            _id: record.role_id,
            deleted: false
        });
        record["role"] = role;
    }
    res.render("admin/pages/accounts/index", {
        pageTitle: "Tài khoản admin",
        records: records
    });
});
exports.index = index;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = yield role_model_1.default.find({
        deleted: false
    });
    res.render("admin/pages/accounts/create", {
        pageTitle: "Tạo mới tài khoản",
        roles: roles
    });
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const emailExist = yield account_model_1.default.findOne({
        email: req.body.email,
        deleted: false
    });
    if (emailExist) {
        req.flash("error", `Email ${req.body.email} đã tồn tại`);
        return res.redirect(`/${config_1.systemConfig.prefixAdmin}/accounts/create`);
    }
    else {
        req.body.password = (0, md5_1.default)(req.body.password);
        const record = new account_model_1.default(req.body);
        yield record.save();
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/accounts`);
    }
});
exports.createPost = createPost;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let find = {
        _id: req.params.id,
        deleted: false
    };
    try {
        const data = yield account_model_1.default.findOne(find).select("-password");
        const roles = yield role_model_1.default.find({
            deleted: false,
        });
        res.render("admin/pages/accounts/edit", {
            pageTitle: "Chỉnh sửa tài khoản",
            data: data,
            roles: roles,
        });
    }
    catch (error) {
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/accounts`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const emailExist = yield account_model_1.default.findOne({
        _id: { $ne: id },
        email: req.body.email,
        deleted: false
    });
    if (emailExist) {
        req.flash("error", `Email ${req.body.email} đã tồn tại`);
    }
    else {
        if (req.body.password) {
            req.body.password = (0, md5_1.default)(req.body.password);
        }
        else {
            delete req.body.password;
        }
        req.flash("success", "Cập nhật tài khoản thành công!");
        yield account_model_1.default.updateOne({ _id: id }, req.body);
    }
    res.redirect(`/${config_1.systemConfig.prefixAdmin}/accounts/edit/${id}`);
});
exports.editPatch = editPatch;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let find = {
        _id: req.params.id,
        deleted: false
    };
    try {
        const data = yield account_model_1.default.findOne(find).select("-password");
        const role = yield role_model_1.default.findOne({
            _id: data.role_id
        });
        data["role"] = role.title;
        res.render("admin/pages/accounts/detail", {
            pageTitle: "Chỉnh sửa tài khoản",
            data: data,
        });
    }
    catch (error) {
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/accounts`);
    }
});
exports.detail = detail;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const redirectUrl = req.query.redirect;
    yield account_model_1.default.updateOne({ _id: id }, {
        deleted: true,
        deletedAt: new Date()
    });
    req.flash("success", `Đã xoá thành công tài khoản!`);
    res.redirect(redirectUrl);
});
exports.deleteItem = deleteItem;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const status = req.params.status;
    const id = req.params.id;
    const redirectUrl = req.query.redirect;
    yield account_model_1.default.updateOne({
        _id: id
    }, {
        status: status
    });
    req.flash("success", "Cập nhật trạng thái thành công!");
    res.redirect(redirectUrl);
});
exports.changeStatus = changeStatus;
