import { Request, Response } from "express";
import Role from "../../models/role.model";
import { systemConfig } from "../../config/config";
import md5 from "md5";
import User from "../../models/user.model";

// [GET] /admin/users
export const index = async (req: Request, res: Response) => {
  let find = {
    deleted: false
  };

  const records = await User.find(find).select("-password-tokenUser");

  res.render("admin/pages/users/index", {
    pageTitle: "Tài khoản user",
    records: records
  });
}

// [DELETE] /admin/users/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const redirectUrl: string = req.query.redirect as string;

  await User.updateOne({ _id: id }, {
    deleted: true,
    deletedAt: new Date()
  });

  (req as any).flash("success", `Đã xoá thành công tài khoản!`);

  res.redirect(redirectUrl);
}

// [PATCH] /admin/users/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  const status: string = req.params.status;
  const id: string = req.params.id;
  const redirectUrl: string = req.query.redirect as string;

  await User.updateOne({
    _id: id
  }, {
    status: status
  });

  (req as any).flash("success", "Cập nhật trạng thái thành công!");

  res.redirect(redirectUrl);
}
