import { Request, Response } from "express";
import Account from "../../models/account.model";
import Role from "../../models/role.model";
import { systemConfig } from "../../config/config";
import md5 from "md5";

// [GET] /admin/auth/login
export const login = async (req: Request, res: Response) => {
  if(req.cookies.token) {
    res.redirect(`/${systemConfig.prefixAdmin}/dashboard`);
  } else {
    res.render("admin/pages/auth/login", {
      pageTitle: "Đăng nhập",
    });
  }
}

// [POST] /admin/auth/login
export const loginPost = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await Account.findOne({
    email: email,
    deleted: false
  });

  if(!user) {
    (req as any).flash("error", "Email không tồn tại!");
    (req as any).flash("old", req.body); 
    res.redirect(`/${systemConfig.prefixAdmin}/auth/login`);
    return;
  }

  if(md5(password) != user.password) {
    (req as any).flash("error", "Sai mật khẩu!");
    (req as any).flash("old", req.body); 
    res.redirect(`/${systemConfig.prefixAdmin}/auth/login`);
    return;
  }

  if(user.status == "inactive") {
    (req as any).flash("error", "Taì khoản đã bị xoá!");
    res.redirect(`/${systemConfig.prefixAdmin}/auth/login`);
    return;
  }

  res.cookie("token", user.token);

  res.redirect(`/${systemConfig.prefixAdmin}/dashboard`);
}

// [GET] /admin/auth/logout
export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.redirect(`/${systemConfig.prefixAdmin}/auth/login`);
}
