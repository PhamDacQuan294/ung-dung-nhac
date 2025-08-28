import { Request, Response } from "express";
import Song from "../../models/song.model";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";
import { systemConfig } from "../../config/config";
import { filterStatus } from "../../helpers/filterStatus";
import { objectSearh } from "../../helpers/search";
import { objectPagination } from "../../helpers/pagination";

// [GET] /admin/songs
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
  const countSongs = await Song.countDocuments(find);

  let buildPagination = objectPagination(
    {
      currentPage: 1,
      limitItems: 2,
      skip: 0
    },
    req.query,
    countSongs
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
  
  const songs = await Song.find(find)
  .sort(sort)
  .limit(buildPagination.limitItems)
  .skip(buildPagination.skip);

  for (const song of songs) {
    const nameSinger = await Singer.findOne({
      _id: song.singerId
    }).select("fullName")

    const nameTopic = await Topic.findOne({
      _id: song.topicId
    }).select("title")

    song["nameTopic"] = nameTopic.title

    song["nameSinger"] = nameSinger.fullName
  }

  res.render("admin/pages/songs/index", {
    pageTitle: "Quản lý bài hát",
    songs: songs,
    filterStatus: statusFilters,
    keyword: searchObj ? searchObj.keyword : "",
    pagination: buildPagination
  });
}

// [PATCH] /admin/songs/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  const status: string = req.params.status;
  const id: string = req.params.id;
  const redirectUrl: string = req.query.redirect as string;

  await Song.updateOne({
    _id: id
  }, {
    status: status
  });

  (req as any).flash("success", "Cập nhật trạng thái thành công!");

  res.redirect(redirectUrl);
}

// [PATCH] /admin/songs/change-multi
export const changeMulti = async (req: Request, res: Response) => {
  const type: string = req.body.type;
  const ids = req.body.ids.split(", ");
  const redirectUrl: string = req.query.redirect as string;

  switch (type) {
    case "active":
      await Song.updateMany({ _id: { $in: ids } }, { status: "active" });
      (req as any).flash("success", `Cập nhật trạng thái thành công ${ids.length} bài hát!`);
      break;
    case "inactive":
      await Song.updateMany({ _id: { $in: ids } }, { status: "inactive" });
      (req as any).flash("success", `Cập nhật trạng thái thành công ${ids.length} bài hát!`);
      break;
    case "delete-all":
      await Song.updateMany({ _id: { $in: ids } }, {
        deleted: true,
        deletedAt: new Date()
      });
      (req as any).flash("success", `Đã xoá thành công ${ids.length} bài hát!`);
      break;
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Song.updateOne({ _id: id }, {
          position: position
        });
      }
      (req as any).flash("success", `Thay đổi vị trí thành công ${ids.length} bài hát!`);
      break;
    default:
      break;
  }

  res.redirect(redirectUrl);
}


// [DELETE] /admin/songs/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const redirectUrl: string = req.query.redirect as string;

  await Song.updateOne({ _id: id }, {
    deleted: true,
    deletedAt: new Date()
  });

  (req as any).flash("success", `Đã xoá thành công bài hát!`);

  res.redirect(redirectUrl);
}

// [GET] /admin/songs/create
export const create = async (req: Request, res: Response) => {
  const topics = await Topic.find({
    status: "active",
    deleted: false
  }).select("title");

  const singers = await Singer.find({
    status: "active",
    deleted: false
  }).select("fullName");

  res.render("admin/pages/songs/create", {
    pageTitle: "Thêm mới bài hát",
    topics: topics,
    singers: singers
  });
}

// [POST] /admin/songs/create
export const createPost = async (req: Request, res: Response) => {
  let avatar = "";
  let audio = "";

  if(req.body.avatar) {
    avatar = req.body.avatar[0];
  }

  if(req.body.audio) {
    audio = req.body.audio[0];
  }

  const dataSong = {
    title: req.body.title,
    topicId: req.body.topicId,
    singerId: req.body.singerId,
    description: req.body.description,
    status: req.body.status,
    avatar: avatar,
    audio: audio,
    lyrics: req.body.lyrics
  };

  const song = new Song(dataSong);
  await song.save();

  res.redirect(`/${systemConfig.prefixAdmin}/songs`);
};

// [GET] /admin/songs/edit/:id
export const edit = async (req: Request, res: Response) => {
  const id = req.params.id;

  const song = await Song.findOne({
    _id: id,
    deleted: false
  });

  const topics = await Topic.find({
    deleted: false
  }).select("title");

  const singers = await Singer.find({
    deleted: false
  }).select("fullName");

  res.render("admin/pages/songs/edit", {
    pageTitle: "Chỉnh sửa bài hát",
    song: song,
    topics: topics,
    singers: singers
  });
}

// [PATCH] /admin/songs/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  const id = req.params.id;

  const dataSong = {
    title: req.body.title,
    topicId: req.body.topicId,
    singerId: req.body.singerId,
    description: req.body.description,
    status: req.body.status,
    lyrics: req.body.lyrics
  };

  if(req.body.avatar) {
    dataSong["avatar"] = req.body.avatar[0];
  }

  if(req.body.audio) {
    dataSong["audio"] = req.body.audio[0];
  }

  await Song.updateOne({
    _id: id
  }, dataSong);

  res.redirect(`/admin/songs/edit/${id}`)
}

// [GET] /admin/songs/detail/:id
export const detail = async (req: Request, res: Response) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id
    };

    const song = await Song.findOne(find);

    const nameSinger = await Singer.findOne({
      _id: song.singerId
    }).select("fullName")

    const nameTopic = await Topic.findOne({
      _id: song.topicId
    }).select("title")

    song["nameTopic"] = nameTopic.title

    song["nameSinger"] = nameSinger.fullName
  

    res.render("admin/pages/songs/detail", {
      pageTitle: song.title,
      song: song
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/songs`);
  }
}