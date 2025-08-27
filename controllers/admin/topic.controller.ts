import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { convertToSlug } from "../../helpers/convertToSlug";
import { filterStatus } from "../../helpers/filterStatus";

// [GET] /admin/topics
export const index = async (req: Request, res: Response) => {
  const statusFilters = filterStatus(req.query);

  let find = {
    deleted: false
  }

  if (req.query.status) {
    find["status"] = req.query.status;
  }

  let keyword: string = "";

  if (req.query.keyword) {
    keyword = `${req.query.keyword}`;

    const keywordRegex = new RegExp(keyword, "i");

    // Tạo ra slug không dấu, có thêm dấu - ngăn cách
    const stringSlug = convertToSlug(keyword);
    const stringSlugRegex = new RegExp(stringSlug, "i");

    find["$or"] = [
      { title: keywordRegex },
      { slug: stringSlugRegex }
    ];
  }

  
  const topics = await Topic.find(find);

  res.render("admin/pages/topics/index", {
    pageTitle: "Quản lý chủ đề",
    topics: topics,
    filterStatus: statusFilters,
    keyword: keyword
  });
}