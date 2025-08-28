import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/admin/role.controller";

router.get("/permissions", controller.index);

router.get("/create", controller.create);

router.post("/create", controller.createPost);

export const roleRoutes: Router = router;