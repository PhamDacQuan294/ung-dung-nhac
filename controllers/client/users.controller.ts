import { Request, Response } from "express";
import User from "../../models/user.model";

// [GET] /users/not-friend
export const notFriend = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;

  const users = await User.find({
    _id: { $ne: userId },
    status: "active",
    deleted: false  
  }).select("id avatar fullName");

  res.render("client/pages/users/not-friend", {
    pageTitle: "Danh sách người dùng",
    users: users
  });
}