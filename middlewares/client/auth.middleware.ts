import { Request, Response, NextFunction } from "express";
import User from "../../models/user.model";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if(!req.cookies.tokenUser) {
    res.redirect(`/user/login`);
  } else {
    const user = await User.findOne({ tokenUser: req.cookies.tokenUser }).select("-password");
    if(!user) {
      res.redirect(`/user/login`);
    } else {
      res.locals.user = user;
      next();
    }
  }
}