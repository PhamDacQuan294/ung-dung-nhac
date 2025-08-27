import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { filterStatus } from "../../helpers/filterStatus";
import { objectSearh } from "../../helpers/search";
import { objectPagination } from "../../helpers/pagination";

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
      break;
    case "inactive":
      await Topic.updateMany({ _id: { $in: ids } }, { status: "inactive" });
      break;
    case "delete-all":
      await Topic.updateMany({ _id: { $in: ids } }, {
        deleted: true,
        deletedAt: new Date()
      });
      break;
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Topic.updateOne({ _id: id }, {
          position: position
        });
      }
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

  res.redirect(redirectUrl);
}