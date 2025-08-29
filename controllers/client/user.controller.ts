import { Request, Response } from "express";
import User from "../../models/user.model";
import md5 from "md5";
import * as generateHelper from "../../helpers/generate";
import * as sendMailHelper from "../../helpers/sendMail";
import ForgotPassword from "../../models/forgot-password.model";

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

// [GET] /user/logout
export const logout = async (req: Request, res: Response) => {
  res.clearCookie("tokenUser");
  res.redirect("/");
}

// [GET] /user/password/forgot
export const forgotPassword = async (req: Request, res: Response) => {
  res.render("client/pages/user/forgot-password", {
    pageTitle: "Lấy lại mật khẩu",
  });
}

// [POST] /user/password/forgot
export const forgotPasswordPost = async (req: Request, res: Response) => {
  const email = req.body.email;

  const user = await User.findOne({
    email: email,
    deleted: false
  });

  if(!user) {
    (req as any).flash("error", "Email không tồn tại");
    res.redirect("/user/password/forgot");
    return;
  }

  // Lưu thông tin vào DB
  const otp = generateHelper.generateRandomNumber(8);

  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: Date.now() 
  };

  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();

  // Nếu tồn tại email thì gửi mã OTP qua email

  const subject = "Mã OTP xác minh lấy lại mật khẩu";
  const html = `
    Mã OTP để lấy lại mật khẩu là <b>${otp}</b>. Thời hạn sử dụng là 3 phút
  `;

  sendMailHelper.sendMail(email, subject, html);
  
  res.redirect(`/user/password/otp?email=${email}`);
}

// [GET] /user/password/otp
export const otpPassword = async (req: Request, res: Response) => {
  const email = req.query.email;

  res.render("client/pages/user/otp-password", {
    pageTitle: "Nhập mã OTP",
    email: email
  });
}

// [POST] /user/password/otp
export const otpPasswordPost = async (req: Request, res: Response) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp
  });

  if(!result) {
    (req as any).flash("error", "OTP không hợp lệ!");
    res.redirect(`/user/password/otp?email=${email}`);
    return;
  }

  const user = await User.findOne({
    email: email
  });

  res.cookie("tokenUser", user.tokenUser);

  res.redirect("/user/password/reset");
}

// [GET] /user/password/reset
export const resetPassword = async (req: Request, res: Response) => {
  res.render("client/pages/user/reset-password", {
    pageTitle: "Đổi mật khẩu"
  });
}

// [POST] /user/password/reset
export const resetPasswordPost = async (req: Request, res: Response) => {
  const password = req.body.password;
  const tokenUser = req.cookies.tokenUser;

  await User.updateOne({
    tokenUser: tokenUser
  }, {
    password: md5(password)
  });

  res.redirect("/");
}