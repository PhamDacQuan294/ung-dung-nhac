import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/client/user.controller";

import * as validate from "../../validates/client/user.validate";

import * as authMiddleware from "../../middlewares/client/auth.middleware";

router.get("/register", controller.register);

router.post("/register", validate.registerPost ,controller.registerPost);

router.get("/login", controller.login);

router.post("/login" ,controller.loginPost);

router.get("/logout", controller.logout);

router.get("/password/forgot", controller.forgotPassword);

router.post("/password/forgot", controller.forgotPasswordPost);

router.get("/password/otp", controller.otpPassword);

router.post("/password/otp", controller.otpPasswordPost);

router.get("/password/reset", controller.resetPassword);

router.post("/password/reset", controller.resetPasswordPost);

router.get("/info", authMiddleware.requireAuth, controller.info);

export const userRoutes: Router = router;