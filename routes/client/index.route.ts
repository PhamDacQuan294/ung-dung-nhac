import { Express } from "express";
import { topicRoutes } from "./topic.route"
import { songRoutes } from "./song.route";
import { favoriteSongRoutes } from "./favorite-song.route";
import { searchRoutes } from "./search.route";
import { homeRoutes } from "./home.route";
import { userRoutes } from "./user.route";
import * as userMiddleware from "../../middlewares/client/user.middleware";
import * as settingMiddleware from "../../middlewares/client/setting.middleware";
import * as authMiddleware from "../../middlewares/client/auth.middleware";
import { chatRoutes } from "./chat.route";
import { usersRoutes } from "./users.route";

const clientRoutes = (app: Express): void => {
  app.use(userMiddleware.infoUser);
  app.use(settingMiddleware.settingGeneral);

  app.use("/", homeRoutes)
  
  app.use("/topics", topicRoutes);

  app.use("/songs", songRoutes);

  app.use(`/favorite-songs`, favoriteSongRoutes);

  app.use(`/search`, searchRoutes);

  app.use("/user", userRoutes);

  app.use("/chat", authMiddleware.requireAuth, chatRoutes);
  
  app.use("/users", authMiddleware.requireAuth, usersRoutes);
}

export default clientRoutes;