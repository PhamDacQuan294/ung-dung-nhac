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

// [GET] /user/login
export const login = async (req: Request, res: Response) => {
  res.render("client/pages/user/login", {
    pageTitle:  "Đăng nhập tài khoản"
  });
}

// [POST] /user/login
export const loginPost = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({
    email: email,
    deleted: false
  });

  if(!user) {
    (req as any).flash("error", "Email không tồn tại!");
    res.redirect("/user/login");
    return;
  }

  if(md5(password) !== user.password) {
    (req as any).flash("error", "Sai mật khẩu!");
    res.redirect("/user/login");
    return;
  }

  if(user.status === "inactive") {
    (req as any).flash("error", "Tài khoản đang bị khoá!");
    res.redirect("/user/login");
    return;
  }

  res.cookie("tokenUser", user.tokenUser);
  
  res.redirect("/")
}