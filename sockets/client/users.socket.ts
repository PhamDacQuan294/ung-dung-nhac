import { Request,  Response } from "express";
import { Socket } from "socket.io";
import User from "../../models/user.model";

export const usersSocket = (req: Request, res: Response) => {
  const _io = (global as any)._io;

  _io.once("connection", (socket: Socket) => {
    socket.on("CLIENT_ADD_FRIEND", async (userId) => {
      const myUserId = res.locals.user.id;

      // Thêm id của A vào acceptFriends của B
      const existIdAinB = await User.findOne({
        _id: userId,
        acceptFriends: myUserId
      });

      if (!existIdAinB) {
        await User.updateOne({
          _id: userId
        }, {
          $push: { acceptFriends: myUserId }
        });
      }

      // Thêm id của B vào requestFriends của A
      const existIdBinA = await User.findOne({
        _id: myUserId,
        requestFriends: userId
      });

      if(!existIdBinA) {
        await User.updateOne({
          _id: myUserId
        }, {
          $push: { requestFriends: userId }
        });
      }
    });
  });
}