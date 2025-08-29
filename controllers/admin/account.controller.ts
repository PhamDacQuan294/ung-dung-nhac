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

// [GET] /admin/accounts/edit/:id
export const edit = async (req: Request, res: Response) => {
  let find = {
    _id: req.params.id,
    deleted: false
  };

  try {
    const data = await Account.findOne(find).select("-password");

    const roles = await Role.find({
      deleted: false,
    });

    res.render("admin/pages/accounts/edit", {
      pageTitle: "Chỉnh sửa tài khoản",
      data: data,
      roles: roles,
    });

  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
  }
}

// [PATCH] /admin/accounts/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  const id = req.params.id;

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

// [GET] /admin/accounts/detail/:id
export const detail = async (req: Request, res: Response) => {
  let find = {
    _id: req.params.id,
    deleted: false
  };

  try {
    const data = await Account.findOne(find).select("-password");

    const role = await Role.findOne({
      _id: data.role_id
    })

    data["role"] = role.title;

    res.render("admin/pages/accounts/detail", {
      pageTitle: "Chỉnh sửa tài khoản",
      data: data,
    });

  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
  }
}

// [DELETE] /admin/accounts/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const redirectUrl: string = req.query.redirect as string;

  await Account.updateOne({ _id: id }, {
    deleted: true,
    deletedAt: new Date()
  });

  (req as any).flash("success", `Đã xoá thành công tài khoản!`);

  res.redirect(redirectUrl);
}

// [PATCH] /admin/accounts/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  const status: string = req.params.status;
  const id: string = req.params.id;
  const redirectUrl: string = req.query.redirect as string;

  await Account.updateOne({
    _id: id
  }, {
    status: status
  });

  (req as any).flash("success", "Cập nhật trạng thái thành công!");

  res.redirect(redirectUrl);
}
