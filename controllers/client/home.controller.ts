import { Request, Response } from "express";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";

// [GET] /
export const index = async (req: Request, res: Response) => {
  const topLikes = await Song.find({})
    .sort({ like: -1 })
    .limit(10);
  
  const topListens = await Song.find({})
    .sort({ listen: -1 })
    .limit(10);
  
  for (const song of topLikes) {
    const infoSinger = await Singer.findOne({
      _id: song.singerId,
      status: "active",
      deleted: false
    });

    song["infoSinger"] = infoSinger;
  }

  for (const song of topListens) {
    const infoSinger = await Singer.findOne({
      _id: song.singerId,
      status: "active",
      deleted: false
    });

    song["infoSinger"] = infoSinger;
  }

  res.render("client/pages/home/index", {
    pageTitle: "Trang chủ",
    topLikes: topLikes,
    topListens: topListens
  });
}