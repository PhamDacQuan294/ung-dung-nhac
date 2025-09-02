import { Request, Response } from "express";
import Singer from "../../models/singer.model";
import { filterStatus } from "../../helpers/filterStatus";
import { objectPagination } from "../../helpers/pagination";
import Account from "../../models/account.model";
import { objectSearh } from "../../helpers/search";
import { systemConfig } from "../../config/config";

// [GET] /admin/singers
export const index = async (req: Request, res: Response) => {
  const statusFilters = filterStatus(req.query);

  let find: any = {
    deleted: false
  }

  if (req.query.status) {
    find["status"] = req.query.status;
  }

  // Search
  const searchObj = objectSearh(req.query);

  if(searchObj) {
    find["$or"] = [
      { title: searchObj.keywordRegex },
      { slug: searchObj.stringSlugRegex }
    ];
  }
  // End search

  // Pagination
  const countSingers = await Singer.countDocuments(find);

  let buildPagination = objectPagination(
    {
      currentPage: 1,
      limitItems: 2,
      skip: 0
    },
    req.query,
    countSingers
  )
  // End pagination

  const records = await Singer.find(find)
    .limit(buildPagination.limitItems)
    .skip(buildPagination.skip);

  for (const singer of records) {
    // Lay ra thong tin nguoi tao
    const user = await Account.findOne({
      _id: singer.createdBy.account_id
    });

    if(user) {
      singer["accountFullName"] = user.fullName;
    }

    // Lay ra thong tin nguoi cap nhat gan nhat
    const updatedBy = singer.updatedBy.slice(-1)[0];

    if(updatedBy) {
      const userUpdated = await Account.findOne({
        _id: updatedBy.account_id
      });

      updatedBy["accountFullName"] = userUpdated.fullName;
    }
  }

  res.render("admin/pages/singers/index", {
    pageTitle: "Quản lý ca sĩ",
    records: records,
    filterStatus: statusFilters,
    keyword: searchObj ? searchObj.keyword : "",
    pagination: buildPagination
  });
}

// [PATCH] /admin/singers/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  const status: string = req.params.status;
  const id: string = req.params.id;
  const redirectUrl: string = req.query.redirect as string;

  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date()
  }

  await Singer.updateOne({
    _id: id
  }, {
    status: status,
    $push: { updatedBy: updatedBy }
  });

  (req as any).flash("success", "Cập nhật trạng thái thành công!");

  res.redirect(redirectUrl);
}

// [PATCH] /admin/singers/change-multi
export const changeMulti = async (req: Request, res: Response) => {
  const type: string = req.body.type;
  const ids = req.body.ids.split(", ");
  const redirectUrl: string = req.query.redirect as string;

  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date()
  }
  
  switch (type) {
    case "active":
      await Singer.updateMany({ _id: { $in: ids } }, { 
        status: "active",
        $push: { updatedBy: updatedBy }
      });
      (req as any).flash("success", `Cập nhật trạng thái thành công ${ids.length} ca sỹ!`);
      break;
    case "inactive":
      await Singer.updateMany({ _id: { $in: ids } }, { 
        status: "inactive",
        $push: { updatedBy: updatedBy }
      });
      (req as any).flash("success", `Cập nhật trạng thái thành công ${ids.length} ca sỹ!`);
      break;
    case "delete-all":
      await Singer.updateMany({ _id: { $in: ids } }, {
        deleted: true,
        deletedBy: {
          account_id: res.locals.user.id,
          deletedAt: new Date()
        }
      });
      (req as any).flash("success", `Đã xoá thành công ${ids.length} ca sỹ!`);
      break;
    default:
      break;
  }

  res.redirect(redirectUrl);
}

// [DELETE] /admin/singers/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const redirectUrl: string = req.query.redirect as string;

  await Singer.updateOne({ _id: id }, {
    deleted: true,
    deletedBy: {
      account_id: res.locals.user.id,
      deletedAt: new Date()
    }
  });

  (req as any).flash("success", `Đã xoá thành công ca sỹ!`);

  res.redirect(redirectUrl);
}

// [GET] /admin/singers/create
export const create = (req: Request, res: Response) => {
  res.render("admin/pages/singers/create", {
    pageTitle: "Thêm mới ca sỹ"
  });
}

// [POST] /admin/singers/create
export const createPost = async (req: Request, res: Response) => {
  let avatar = "";

  if(req.body.avatar) {
    avatar = req.body.avatar;
  }

  const createdBy = {
    account_id: res.locals.user.id
  };

  const dataSinger = {
    title: req.body.title,
    status: req.body.status,
    avatar: avatar,
    createdBy: createdBy 
  };

  const singer = new Singer(dataSinger);
  await singer.save();

  res.redirect(`/${systemConfig.prefixAdmin}/singers`);
}

// [GET] /admin/singers/edit/:id 
export const edit = async (req: Request, res: Response) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id
    }

    const singer = await Singer.findOne(find);

    res.render("admin/pages/singers/edit", {
      pageTitle: "Chỉnh sửa ca sỹ",
      singer: singer
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/singers`);
  }
}

// [PATCH] /admin/singers/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  const id = req.params.id;

  const dataSinger = {
    fullName: req.body.title,
    status: req.body.status,
  }

  if(req.body.avatar) {
    dataSinger["avatar"] = req.body.avatar;
  }

  try {
    const updatedBy = {
      account_id: res.locals.user.id,
      updatedAt: new Date()
    }

    await Singer.updateOne({ _id: id }, {
      ...dataSinger,
      $push: { updatedBy: updatedBy }
    });
    (req as any).flash("success", `Cập nhật thành công ca sỹ!`);
  } catch (error) {
    (req as any).flash("success", `Cập nhật chưa thành công ca sỹ!`);
  }

  res.redirect(`/${systemConfig.prefixAdmin}/singers/edit/${id}`);
}

// [GET] /admin/singers/detail/:id
export const detail = async (req: Request, res: Response) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id
    };

    const singer = await Singer.findOne(find);

    res.render("admin/pages/singers/detail", {
      pageTitle: singer.fullName,
      singer: singer
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/singers`);
  }
}