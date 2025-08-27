import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { filterStatus } from "../../helpers/filterStatus";
import { objectSearh } from "../../helpers/search";
import { skip } from "node:test";

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
  let objectPagination = {
    currentPage: 1,
    limitItems: 2,
    skip: 0,
  };

  if(req.query.page) {
    objectPagination.currentPage = parseInt(req.query.page as string, 10);
  }

  objectPagination["skip"]= (objectPagination.currentPage - 1) * objectPagination.limitItems;

  const countTopics = await Topic.countDocuments(find);
  const totalPage = Math.ceil(countTopics/objectPagination.limitItems);
  objectPagination["totalPage"] = totalPage;
  // End pagination


  const topics = await Topic.find(find)
  .limit(objectPagination.limitItems)
  .skip(objectPagination.skip);

  res.render("admin/pages/topics/index", {
    pageTitle: "Quản lý chủ đề",
    topics: topics,
    filterStatus: statusFilters,
    keyword: searchObj ? searchObj.keyword : "",
    pagination: objectPagination
  });
}