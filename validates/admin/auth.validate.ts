import { NextFunction, Request, Response } from "express";

export const loginPost = async (req: Request, res: Response, next: NextFunction) =>  {
 if (!req.body.email) {
    (req as any).flash("error", "Vui lòng nhập email!");
    return res.redirect("admin/auth/login");
  }

  if (!req.body.password) {
    (req as any).flash("error", "Vui lòng nhập password!");
    return res.redirect("admin/auth/login");
  }

  next();
}