import { Request, Response, NextFunction } from "express";
import RoomChat from "../../models/rooms-chat.model";

export const isAccess = async (req: Request, res: Response, next: NextFunction) =>  {
  const roomChatId = req.params.roomChatId;
  const userId = res.locals.user.id;

  const existUserInRoomChat = await RoomChat.findOne({
    _id: roomChatId,
    "users.user_id": userId,
    deleted: false
  });

  if(existUserInRoomChat) {
    next();
  } else {
    res.redirect("/");
  }
}