import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/client/chat.controller";

import * as chatMiddleware from "../../middlewares/client/chat.middleware";

router.get("/:roomChatId", chatMiddleware.isAccess, controller.index);

export const chatRoutes: Router = router;