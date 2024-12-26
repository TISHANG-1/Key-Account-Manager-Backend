import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.js";
import {
  getUserDetails,
  signUpUser,
  signInUser,
  getUsersList,
} from "../controllers/user.js";

const router = Router();

router.post("/sign-up", signUpUser);
router.post("/sign-in", signInUser);
router.get("/profile", authenticateToken, getUserDetails);
router.get("/list", authenticateToken, getUsersList);

export { router };
