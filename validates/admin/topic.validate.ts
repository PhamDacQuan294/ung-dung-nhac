import { NextFunction, Request, Response } from "express";

export const createPost = async (req: Request, res: Response, next: NextFunction) =>  {
  const redirectUrl: string = req.query.redirect as string;

  
  if (!req.body.title) {
    (req as any).flash("error", "Vui lòng nhập tiêu đề!");

    return res.redirect(redirectUrl);
  }

  next();
}