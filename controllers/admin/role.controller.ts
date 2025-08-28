import { Request, Response } from "express";
import Role from "../../models/role.model";
import { systemConfig } from "../../config/config";

// [GET] /admin/roles
export const index = async (req: Request, res: Response) => {
  let find = {
    deleted: false
  };

  const records = await Role.find(find);

  res.render("admin/pages/roles/index", {
    pageTitle: "Nhóm quyền",
    records: records
  });
}

// [GET] /admin/roles/create
export const create = async (req: Request, res: Response) => {
  res.render("admin/pages/roles/create", {
    pageTitle: "Tạo nhóm quyền",
  });
}

// [POST] /admin/roles/create
export const createPost = async (req: Request, res: Response) => {
  const record = new Role(req.body);
  await record.save();

  res.redirect(`/${systemConfig.prefixAdmin}/roles/permissions`);
}

// [GET] /admin/roles/edit/:id
export const edit = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    let find = {
      _id: id,
      deleted: false
    };

    const data = await Role.findOne(find);

    res.render("admin/pages/roles/edit", {
      pageTitle: "Sửa nhóm quyền",
      data: data
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
}

// [PATCH] /admin/roles/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await Role.updateOne({ _id: id }, req.body);

    (req as any).flash("success", "Cập nhật nhóm quyền thành công");

  } catch (error) {
    (req as any).flash("error", "Cập nhật lỗi");
  }

  res.redirect(`/${systemConfig.prefixAdmin}/roles/edit/${id}`);
}

// [DELETE] /admin/songs/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const redirectUrl: string = req.query.redirect as string;

  await Role.updateOne({ _id: id }, {
    deleted: true,
    deletedAt: new Date()
  });

  (req as any).flash("success", `Đã xoá thành công!`);

  res.redirect(redirectUrl);
}

// [GET] /admin/roles/detail/:id
export const detail = async (req: Request, res: Response) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id
    };

    const role = await Role.findOne(find);

    res.render("admin/pages/roles/detail", {
      pageTitle: role.title,
      role: role
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/roles/permissions`);
  }
}