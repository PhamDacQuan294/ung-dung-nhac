import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { filterStatus } from "../../helpers/filterStatus";
import { objectSearh } from "../../helpers/search";
import { objectPagination } from "../../helpers/pagination";
import { systemConfig } from "../../config/config";
import { title } from "process";

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


  const topics = await Topic.find(find)
  .sort({ position: "desc" })
  .limit(buildPagination.limitItems)
  .skip(buildPagination.skip);
  
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

  await Topic.updateOne({
    _id: id
  }, {
    status: status
  });

  (req as any).flash("success", "Cập nhật trạng thái thành công!");

  res.redirect(redirectUrl);
}

// [PATCH] /admin/topics/change-multi
export const changeMulti = async (req: Request, res: Response) => {
  const type: string = req.body.type;
  const ids = req.body.ids.split(", ");
  const redirectUrl: string = req.query.redirect as string;

  switch (type) {
    case "active":
      await Topic.updateMany({ _id: { $in: ids } }, { status: "active" });
      (req as any).flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
      break;
    case "inactive":
      await Topic.updateMany({ _id: { $in: ids } }, { status: "inactive" });
      (req as any).flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
      break;
    case "delete-all":
      await Topic.updateMany({ _id: { $in: ids } }, {
        deleted: true,
        deletedAt: new Date()
      });
      (req as any).flash("success", `Đã xoá thành công ${ids.length} sản phẩm!`);
      break;
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Topic.updateOne({ _id: id }, {
          position: position
        });
      }
      (req as any).flash("success", `Thay đổi vị trí thành công ${ids.length} sản phẩm!`);
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
    deletedAt: new Date()
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

  const dataTopic = {
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    avatar: avatar,
    position: req.body.position
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
    await Topic.updateOne({ _id: id }, dataTopic);
    (req as any).flash("success", `Cập nhật thành công sản phẩm!`);
  } catch (error) {
    (req as any).flash("success", `Cập nhật chưa thành công sản phẩm!`);
  }

  res.redirect(`/${systemConfig.prefixAdmin}/topics/edit/${id}`);
}