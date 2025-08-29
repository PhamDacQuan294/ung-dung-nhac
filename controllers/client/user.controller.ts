import { Request, Response } from "express";
import User from "../../models/user.model";
import md5 from "md5";

// [GET] /user/register
export const register = async (req: Request, res: Response) => {
  res.render("client/pages/user/register", {
    pageTitle:  "Đăng ký tài khoản"
  });
}

// [POST] /user/register
export const registerPost = async (req: Request, res: Response) => {
  const existEmail = await User.findOne({
    email: req.body.email
  });

  if(existEmail) {
    (req as any).flash("error", "Email đã tồn tại!");
    res.redirect("/user/register");
    return;
  }

  req.body.password = md5(req.body.password);

  const user = new User(req.body);
  await user.save();

  (req as any).flash("success", "Đăng ký thành công!");
  res.cookie("tokenUser", user.tokenUser);

  res.redirect("/");
}
