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
exports.usersSocket = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const usersSocket = (req, res) => {
    const _io = global._io;
    _io.once("connection", (socket) => {
        socket.on("CLIENT_ADD_FRIEND", (userId) => __awaiter(void 0, void 0, void 0, function* () {
            const myUserId = res.locals.user.id;
            const existIdAinB = yield user_model_1.default.findOne({
                _id: userId,
                acceptFriends: myUserId
            });
            if (!existIdAinB) {
                yield user_model_1.default.updateOne({
                    _id: userId
                }, {
                    $push: { acceptFriends: myUserId }
                });
            }
            const existIdBinA = yield user_model_1.default.findOne({
                _id: myUserId,
                requestFriends: userId
            });
            if (!existIdBinA) {
                yield user_model_1.default.updateOne({
                    _id: myUserId
                }, {
                    $push: { requestFriends: userId }
                });
            }
        }));
    });
};
exports.usersSocket = usersSocket;
