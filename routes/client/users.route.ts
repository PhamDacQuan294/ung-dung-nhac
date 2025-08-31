import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/client/users.controller"

router.get("/not-friend", controller.notFriend);

router.get("/request", controller.request);

router.get("/accept", controller.accept);

router.get("/friends", controller.friends);

export const usersRoutes: Router = router;