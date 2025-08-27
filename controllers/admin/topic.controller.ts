import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { convertToSlug } from "../../helpers/convertToSlug";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";

// [GET] /admin/topics
export const index = async (req: Request, res: Response) => {
  let filterStatus = [
    {
      name: "Tất cả",
      status: "",
      class: ""
    },
    {
      name: "Hoạt động",
      status: "active",
      class: ""
    },
    {
      name: "Dừng hoạt động",
      status: "inactive",
      class: ""
    }
  ];

  if(req.query.status) {
    const index = filterStatus.findIndex(item => item.status == req.query.status);
    filterStatus[index].class = "active";
  } else {
    const index = filterStatus.findIndex(item => item.status == "");
    filterStatus[index].class = "active";
  }

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
    filterStatus: filterStatus,
    keyword: keyword
  });
}