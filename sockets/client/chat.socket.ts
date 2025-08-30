import { Request, Response } from "express";
import Chat from "../../models/chat.model";
import { Socket } from "socket.io";

export const chatSocket = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const fullName = res.locals.user.fullName;

  const _io = (global as any)._io;

  _io.once("connection", (socket: Socket) => {
    socket.on("CLIENT_SEND_MESSAGE", async (content) => {
      // Save in database
      const chat = new Chat({
        user_id: userId,
        content: content
      });
      await chat.save();

      // Trả data về client
      
      _io.emit("SERVER_RETURN_MESSAGE", {
        userId: userId,
        fullName: fullName,
        content: content
      });
    });

    // Typing
    socket.on("CLIENT_SEND_TYPING", async (type) => {
      socket.broadcast.emit("SERVER_RETURN_TYPING", {
        userId: userId,
        fullName: fullName,
        type: type
      })
    });
  });
}