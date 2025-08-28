import { Router } from "express";
const router: Router = Router();
import multer from "multer";

import * as controller from "../../controllers/admin/topic.controller";
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware";
import * as validate from "../../validates/admin/topic.validate";

const upload = multer();

router.get("/", controller.index);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.delete("/delete/:id", controller.deleteItem);

router.get("/create", controller.create);

router.post(
  "/create", 
  upload.single("avatar"),
  uploadCloud.uploadSingle,
  validate.createPost,
  controller.createPost,
);

router.get("/edit/:id", controller.edit);

router.patch(
  "/edit/:id", 
  upload.single("avatar"),
  uploadCloud.uploadSingle,
  validate.createPost, 
  controller.editPatch
);

export const topicRoutes: Router = router;