import { Request, Response } from "express";

// [GET] /rooms-chat
export const index = async (req: Request, res: Response) => {
  res.render("client/pages/rooms-chat/index", {
    pageTitle: "Danh sách phòng"
  })
}