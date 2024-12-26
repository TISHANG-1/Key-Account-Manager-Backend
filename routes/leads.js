import { Router } from "express";
import {
  createLead,
  deleteLead,
  getAllLeads,
  updateLead,
  getLeadById,
} from "../controllers/leads.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = Router();

router.get("/id/:id", authenticateToken, getLeadById);
router.get("/", authenticateToken, getAllLeads);
router.post("/create", authenticateToken, createLead);
router.put("/:id", authenticateToken, updateLead);
router.delete("/:id", authenticateToken, deleteLead);

export { router };
