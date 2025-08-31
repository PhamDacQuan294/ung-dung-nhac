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
exports.friends = exports.accept = exports.request = exports.notFriend = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const users_socket_1 = require("../../sockets/client/users.socket");
const notFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, users_socket_1.usersSocket)(req, res);
    const userId = res.locals.user.id;
    const myUser = yield user_model_1.default.findOne({
        _id: userId
    });
    const requestFriends = myUser.requestFriends;
    const acceptFriends = myUser.acceptFriends;
    const friendList = myUser.friendList;
    const friendListId = friendList.map(item => item.user_id);
    const users = yield user_model_1.default.find({
        $and: [
            { _id: { $ne: userId } },
            { _id: { $nin: requestFriends } },
            { _id: { $nin: acceptFriends } },
            { _id: { $nin: friendListId } }
        ],
        status: "active",
        deleted: false
    }).select("id avatar fullName");
    res.render("client/pages/users/not-friend", {
        pageTitle: "Danh sách người dùng",
        users: users
    });
});
exports.notFriend = notFriend;
const request = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, users_socket_1.usersSocket)(req, res);
    const userId = res.locals.user.id;
    const myUser = yield user_model_1.default.findOne({
        _id: userId
    });
    const requestFriends = myUser.requestFriends;
    const users = yield user_model_1.default.find({
        _id: { $in: requestFriends },
        status: "active",
        deleted: false
    }).select("id avatar fullName");
    res.render("client/pages/users/request", {
        pageTitle: "Lời mời đã gửi",
        users: users
    });
});
exports.request = request;
const accept = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, users_socket_1.usersSocket)(req, res);
    const userId = res.locals.user.id;
    const myUser = yield user_model_1.default.findOne({
        _id: userId
    });
    const acceptFriends = myUser.acceptFriends;
    const users = yield user_model_1.default.find({
        _id: { $in: acceptFriends },
        status: "active",
        deleted: false
    }).select("id avatar fullName");
    res.render("client/pages/users/accept", {
        pageTitle: "Lời mời đã nhận",
        users: users
    });
});
exports.accept = accept;
const friends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, users_socket_1.usersSocket)(req, res);
    const userId = res.locals.user.id;
    const myUser = yield user_model_1.default.findOne({
        _id: userId
    });
    const friendList = myUser.friendList;
    const friendListId = friendList.map(item => item.user_id);
    const users = yield user_model_1.default.find({
        _id: { $in: friendListId },
        status: "active",
        deleted: false
    }).select("id avatar fullName statusOnline");
    for (const user of users) {
        const infoFriend = friendList.find(friend => friend.user_id == user.id);
        user["infoFriend"] = infoFriend;
    }
    res.render("client/pages/users/friends", {
        pageTitle: "Danh sách bạn bè",
        users: users
    });
});
exports.friends = friends;
