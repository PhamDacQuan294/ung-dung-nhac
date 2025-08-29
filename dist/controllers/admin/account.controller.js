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
exports.createPost = exports.create = exports.index = void 0;
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
