import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";

// [GET] /admin/dashboard
export const index = async (req: Request, res: Response) => {
  const statistic = {
    topic: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    song: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    singer: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    account: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    user: {
      total: 0,
      active: 0,
      inactive: 0,
    }
  }

  statistic.topic.total = await Topic.countDocuments({
    deleted: false
  });

  statistic.topic.active = await Topic.countDocuments({
    status: "active",
    deleted: false
  });

  statistic.topic.inactive = await Topic.countDocuments({
    status: "inactive",
    deleted: false
  });

  statistic.song.total = await Song.countDocuments({
    deleted: false
  });

  statistic.song.active = await Song.countDocuments({
    status: "active",
    deleted: false
  });

  statistic.song.inactive = await Song.countDocuments({
    status: "inactive",
    deleted: false
  });

  res.render("admin/pages/dashboard/index", {
    pageTitle: "Tổng quan",
    statistic: statistic
  });
}