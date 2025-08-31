import { Request, Response } from "express";
import User from "../../models/user.model";
import RoomChat from "../../models/rooms-chat.model";

// [GET] /rooms-chat
export const index = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;

  const listRoomChat = await RoomChat.find({
    "users.user_id": userId,
    typeRoom: "group",
    deleted: false
  });

  res.render("client/pages/rooms-chat/index", {
    pageTitle: "Danh sách phòng",
    listRoomChat: listRoomChat
  })
}

// [GET] /rooms-chat/create
export const create = async (req: Request, res: Response) => {
  const friendList = res.locals.user.friendList;

  for (const friend of friendList) {
    const infoFriend = await User.findOne({
      _id: friend.user_id,
      deleted: false
    }).select("fullName avatar");

    friend["infoFriend"] = infoFriend;
  }

  res.render("client/pages/rooms-chat/create", {
    pageTitle: "Tạo phòng",
    friendList: friendList
  });
}

// [POST] /rooms-chat/create
export const createPost = async (req: Request, res: Response) => {
  const title = req.body.title;
  let usersId = req.body.usersId;

  if (!Array.isArray(usersId)) {
    usersId = [usersId];
  }

  const dataRoom = {
    title: title,
    typeRoom: "group",
    users: []
  };

  for (const userId of usersId) {
    dataRoom.users.push({
      user_id: userId,
      role: "user"
    });
  }


  dataRoom.users.push({
    user_id: res.locals.user.id,
    role: "superAdmin"
  });

  const roomChat = new RoomChat(dataRoom);
  await roomChat.save();

  res.redirect(`/chat/${roomChat.id}`);
}