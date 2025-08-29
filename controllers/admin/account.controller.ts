import { Request, Response } from "express";
import Account from "../../models/account.model";
import Role from "../../models/role.model";
import { systemConfig } from "../../config/config";
import md5 from "md5";

// [GET] /admin/accounts
export const index = async (req: Request, res: Response) => {
  let find = {
    deleted: false
  };

  const records = await Account.find(find).select("-password-token");

  for (const record of records) {
    const role = await Role.findOne({
      _id: record.role_id,
      deleted: false
    });
    record["role"]= role;
  }

  res.render("admin/pages/accounts/index", {
    pageTitle: "Tài khoản admin",
    records: records
  });
}

// [GET] /admin/accounts/create
export const create = async (req: Request, res: Response) => {
  const roles = await Role.find({
    deleted: false
  });

  res.render("admin/pages/accounts/create", {
    pageTitle: "Tạo mới tài khoản",
    roles: roles
  });
}

// [POST] /admin/accounts/create
export const createPost = async (req: Request, res: Response) => {
  const emailExist = await Account.findOne({
    email: req.body.email,
    deleted: false
  });

  if(emailExist) {
    (req as any).flash("error", `Email ${req.body.email} đã tồn tại`);

    return res.redirect(`/${systemConfig.prefixAdmin}/accounts/create`);
  } else {
    req.body.password = md5(req.body.password);

    const record = new Account(req.body);
    await record.save();

    res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
  }
}