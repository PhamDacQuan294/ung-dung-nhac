import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/client/users.controller"

router.get("/not-friend", controller.notFriend);

export const usersRoutes: Router = router;