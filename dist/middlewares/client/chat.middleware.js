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
exports.isAccess = void 0;
const rooms_chat_model_1 = __importDefault(require("../../models/rooms-chat.model"));
const isAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const roomChatId = req.params.roomChatId;
    const userId = res.locals.user.id;
    const existUserInRoomChat = yield rooms_chat_model_1.default.findOne({
        _id: roomChatId,
        "users.user_id": userId,
        deleted: false
    });
    if (existUserInRoomChat) {
        next();
    }
    else {
        res.redirect("/");
    }
});
exports.isAccess = isAccess;
