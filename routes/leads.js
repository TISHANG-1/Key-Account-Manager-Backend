import { Router } from "express";
import {
  createLead,
  deleteLead,
  getAllLeadsForKAM,
  getAllLeads,
  updateLead,
  getLeadById,
} from "../controllers/leads.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { roleMiddleware } from "../middleware/validateUserRoles.js";

const router = Router();

router.get("/id/:id", authenticateToken, getLeadById);
router.get("/", authenticateToken, getAllLeadsForKAM);
router.get("/all", authenticateToken, roleMiddleware(["admin"]), getAllLeads);
router.post("/create", authenticateToken, createLead);
router.put("/:id", authenticateToken, updateLead);
router.delete("/:id", authenticateToken, deleteLead);

export { router };
