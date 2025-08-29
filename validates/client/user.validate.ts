import { NextFunction, Request, Response } from "express";

export const registerPost = async (req: Request, res: Response, next: NextFunction) =>  {
   if (!req.body.fullName) {
    (req as any).flash("error", "Vui lòng nhập họ tên!");
    return res.redirect("/user/register");
  }

  if (!req.body.email) {
    (req as any).flash("error", "Vui lòng nhập email!");
    return res.redirect("/user/register");
  }

  if (!req.body.password) {
    (req as any).flash("error", "Vui lòng nhập mật khẩu!");
    return res.redirect("/user/register");
  }

  next();
}