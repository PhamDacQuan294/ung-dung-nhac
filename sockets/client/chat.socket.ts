import { Request, Response } from "express";
import Chat from "../../models/chat.model";
import { Socket } from "socket.io";

export const chatSocket = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const fullName = res.locals.user.fullName;

  const roomChatId = req.params.roomChatId;

  const _io = (global as any)._io;

  _io.once("connection", (socket: Socket) => {

    socket.join(roomChatId);

    socket.on("CLIENT_SEND_MESSAGE", async (content) => {
      // Save in database
      const chat = new Chat({
        user_id: userId,
        room_chat_id: roomChatId,
        content: content
      });
      await chat.save();

      // Trả data về client
      
      _io.to(roomChatId).emit("SERVER_RETURN_MESSAGE", {
        userId: userId,
        fullName: fullName,
        content: content
      });
    });

    // Typing
    socket.on("CLIENT_SEND_TYPING", async (type) => {
      socket.broadcast.to(roomChatId).emit("SERVER_RETURN_TYPING", {
        userId: userId,
        fullName: fullName,
        type: type
      })
    });
  });
}