import { Request, Response } from "express";
import { chatSocket } from "../../sockets/client/chat.socket";
import Chat from "../../models/chat.model";
import User from "../../models/user.model";

// [GET] /chat/:roomChatId
export const index = async (req: Request, res: Response) => {
  const roomChatId = req.params.roomChatId;

  // SocketIO
  chatSocket(req, res);
  // End SocketIO

  // Lấy dữ liệu từ database
  const chats = await Chat.find({
    room_chat_id: roomChatId,
    deleted: false
  })

  for (const chat of chats) {
    const infoUser = await User.findOne({
      _id: chat.user_id
    }).select("fullName");

    chat["infoUser"] = infoUser;
  }
  // Hết lấy dữ liệu từ database

  res.render("client/pages/chat/index", {
    pageTitle: "Chat",
    chats: chats
  })
}