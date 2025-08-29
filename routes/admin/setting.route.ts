import { Router } from "express";
const router: Router = Router();
import multer from "multer";

const upload = multer();

import * as controller from "../../controllers/admin/setting.controller"

import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware";

router.get("/general", controller.general);

router.patch(
  "/general", 
  upload.single("logo"),
  uploadCloud.uploadSingle,
  controller.generalPatch
);


export const settingRoutes: Router = router;