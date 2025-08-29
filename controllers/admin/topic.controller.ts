import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { filterStatus } from "../../helpers/filterStatus";
import { objectSearh } from "../../helpers/search";
import { objectPagination } from "../../helpers/pagination";
import { systemConfig } from "../../config/config";
import Account from "../../models/account.model";

// [GET] /admin/topics
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
  const countTopics = await Topic.countDocuments(find);

  let buildPagination = objectPagination(
    {
      currentPage: 1,
      limitItems: 2,
      skip: 0
    },
    req.query,
    countTopics
  )

  // End pagination

  // Sort
  let sort: any = {};

  if (req.query.sortKey && req.query.sortValue) {
    const sortKey = String(req.query.sortKey);
    const sortValue = req.query.sortValue === "desc" ? -1 : 1; // MongoDB cần 1 hoặc -1
    sort[sortKey] = sortValue;
  } else {
    sort["position"] = -1; // mặc định sort giảm dần theo position
  }
  // End Sort

  const topics = await Topic.find(find)
  .sort(sort)
  .limit(buildPagination.limitItems)
  .skip(buildPagination.skip);
  
  for (const topic of topics) {
    // Lay ra thong tin nguoi tao
    const user = await Account.findOne({
      _id: topic.createdBy.account_id
    });

    if(user) {
      topic["accountFullName"] = user.fullName;
    }

    // Lay ra thong tin nguoi cap nhat gan nhat
    const updatedBy = topic.updatedBy.slice(-1)[0];

    if(updatedBy) {
      const userUpdated = await Account.findOne({
        _id: updatedBy.account_id
      });

      updatedBy["accountFullName"] = userUpdated.fullName;
    }
  }


  res.render("admin/pages/topics/index", {
    pageTitle: "Quản lý chủ đề",
    topics: topics,
    filterStatus: statusFilters,
    keyword: searchObj ? searchObj.keyword : "",
    pagination: buildPagination
  });
}

// [PATCH] /admin/topics/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  const status: string = req.params.status;
  const id: string = req.params.id;
  const redirectUrl: string = req.query.redirect as string;

  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date()
  }

  await Topic.updateOne({
    _id: id
  }, {
    status: status,
    $push: { updatedBy: updatedBy }
  });

  (req as any).flash("success", "Cập nhật trạng thái thành công!");

  res.redirect(redirectUrl);
}

// [PATCH] /admin/topics/change-multi
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
      await Topic.updateMany({ _id: { $in: ids } }, { 
        status: "active",
        $push: { updatedBy: updatedBy }
      });
      (req as any).flash("success", `Cập nhật trạng thái thành công ${ids.length} chủ đề!`);
      break;
    case "inactive":
      await Topic.updateMany({ _id: { $in: ids } }, { 
        status: "inactive",
        $push: { updatedBy: updatedBy }
      });
      (req as any).flash("success", `Cập nhật trạng thái thành công ${ids.length} chủ đề!`);
      break;
    case "delete-all":
      await Topic.updateMany({ _id: { $in: ids } }, {
        deleted: true,
        deletedBy: {
          account_id: res.locals.user.id,
          deletedAt: new Date()
        }
      });
      (req as any).flash("success", `Đã xoá thành công ${ids.length} chủ đề!`);
      break;
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Topic.updateOne({ _id: id }, {
          position: position,
          $push: { updatedBy: updatedBy }
        });
      }
      (req as any).flash("success", `Thay đổi vị trí thành công ${ids.length} chủ đề!`);
      break;
    default:
      break;
  }

  res.redirect(redirectUrl);
}

// [DELETE] /admin/topics/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const redirectUrl: string = req.query.redirect as string;

  await Topic.updateOne({ _id: id }, {
    deleted: true,
    deletedBy: {
      account_id: res.locals.user.id,
      deletedAt: new Date()
    }
  });

  (req as any).flash("success", `Đã xoá thành công sản phẩm!`);

  res.redirect(redirectUrl);
}

// [GET] /admin/topics/create
export const create = (req: Request, res: Response) => {
  res.render("admin/pages/topics/create", {
    pageTitle: "Thêm mới chủ đề"
  });
}

// [POST] /admin/topics/create
export const createPost = async (req: Request, res: Response) => {
  let avatar = "";

  if(req.body.avatar) {
    avatar = req.body.avatar;
  }

  if(req.body.position == "") {
    const countTopics = await Topic.countDocuments();
    req.body.position = countTopics + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }

  const createdBy = {
    account_id: res.locals.user.id
  };

  const dataTopic = {
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    avatar: avatar,
    position: req.body.position,
    createdBy: createdBy 
  };

  const topic = new Topic(dataTopic);
  await topic.save();

  res.redirect(`/${systemConfig.prefixAdmin}/topics`);
}

// [GET] /admin/topics/edit/:id 
export const edit = async (req: Request, res: Response) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id
    }

    const topic = await Topic.findOne(find);

    res.render("admin/pages/topics/edit", {
      pageTitle: "Chỉnh sửa chủ đề",
      topic: topic,
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  }
}

// [PATCH] /admin/topics/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  const id = req.params.id;

  const dataTopic = {
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    position: req.body.position
  }

  if(req.body.avatar) {
    dataTopic["avatar"] = req.body.avatar;
  }

  try {
    const updatedBy = {
      account_id: res.locals.user.id,
      updatedAt: new Date()
    }

    await Topic.updateOne({ _id: id }, {
      ...dataTopic,
      $push: { updatedBy: updatedBy }
    });
    (req as any).flash("success", `Cập nhật thành công sản phẩm!`);
  } catch (error) {
    (req as any).flash("success", `Cập nhật chưa thành công sản phẩm!`);
  }

  res.redirect(`/${systemConfig.prefixAdmin}/topics/edit/${id}`);
}

// [GET] /admin/topics/detail/:id
export const detail = async (req: Request, res: Response) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id
    };

    const topic = await Topic.findOne(find);

    res.render("admin/pages/topics/detail", {
      pageTitle: topic.title,
      topic: topic
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  }
}