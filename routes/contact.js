import { Router } from "express";
import {
  createContact,
  getContactsForLead,
  updateContact,
  deleteContact,
} from "../controllers/contact.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = Router();
router.post("/create", authenticateToken, createContact);
router.get("/:restaurant_id", authenticateToken, getContactsForLead);
router.put("/:id", authenticateToken, updateContact);
router.delete("/:id", authenticateToken, deleteContact);

export { router };
