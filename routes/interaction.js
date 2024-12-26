import { Router } from "express";
import {
  createInteraction,
  deleteInteraction,
  getInteractionForLead,
  updateInteraction,
} from "../controllers/interaction.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = Router();

router.post("/create", authenticateToken, createInteraction);
router.get("/:restaurant_id", authenticateToken, getInteractionForLead);
router.delete("/:id", authenticateToken, deleteInteraction);
router.put("/:id", authenticateToken, updateInteraction);

export { router };
