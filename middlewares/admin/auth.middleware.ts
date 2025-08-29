import { Request, Response, NextFunction } from "express";
import { systemConfig } from "../../config/config";
import Account from "../../models/account.model";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if(!req.cookies.token) {
    res.redirect(`/${systemConfig.prefixAdmin}/auth/login`);
  } else {
    const user = await Account.findOne({ token: req.cookies.token });
    if(!user) {
      res.redirect(`/${systemConfig.prefixAdmin}/auth/login`);
    } else {
      next();
    }
  }
}