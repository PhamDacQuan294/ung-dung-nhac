import { Request, Response } from "express";
import Account from "../../models/account.model";
import { systemConfig } from "../../config/config";
import md5 from "md5";

// [GET] /admin/my-account
export const index = async (req: Request, res: Response) => {
  res.render("admin/pages/my-account/index", {
    pageTitle: "Thông tin cá nhân"
  });
}

// [GET] /admin/my-account/edit
export const edit = async (req: Request, res: Response) => {
  res.render("admin/pages/my-account/edit", {
    pageTitle: "Chỉnh sửa thông tin cá nhân"
  });
}

// [PATCH] /admin/my-account/edit
export const editPatch = async (req: Request, res: Response) => {
  const id = res.locals.user.id;

  const emailExist = await Account.findOne({
    _id: { $ne: id },
    email: req.body.email,
    deleted: false
  });

  if(emailExist) {
    (req as any).flash("error", `Email ${req.body.email} đã tồn tại`);
  } else {

    if(req.body.password) {
      req.body.password = md5(req.body.password);
    } else {
      delete req.body.password;
    }

    (req as any).flash("success", "Cập nhật tài khoản thành công!");

    await Account.updateOne({ _id: id }, req.body);
  }

  res.redirect(`/${systemConfig.prefixAdmin}/accounts/edit/${id}`);
}
