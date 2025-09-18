// backend/routes/user.routes.js
import express from "express";
import IsAuth from "../middlewares/IsAuth.js";
import multer from "multer";
import { getCurrentUser, updateAssistant, askToAssistant } from "../controllers/user.controllers.js";

const userRouter = express.Router();
const upload = multer({ dest: "uploads/" }); // temp folder for file upload

userRouter.get("/me", IsAuth, getCurrentUser);
userRouter.post("/updateAssistant", IsAuth, upload.single("assistantImage"), updateAssistant);
userRouter.post("/askToAssistant", IsAuth, askToAssistant);

export default userRouter;
