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
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPost = void 0;
const registerPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.fullName) {
        req.flash("error", "Vui lòng nhập họ tên!");
        return res.redirect("/user/register");
    }
    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập email!");
        return res.redirect("/user/register");
    }
    if (!req.body.password) {
        req.flash("error", "Vui lòng nhập mật khẩu!");
        return res.redirect("/user/register");
    }
    next();
});
exports.registerPost = registerPost;
