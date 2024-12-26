import { Router } from "express";
import {
  deleteCallSchedule,
  getScheduleCallsForLead,
  getScheduleCallsForKAM,
  scheduleCall,
  updateCallSchedule,
  markCallAttended,
  getCallsForToday,
  getCallsWithLeadToday,
} from "../controllers/callSchedule.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = Router();

router.post("/create", authenticateToken, scheduleCall);
router.get(
  "/restaurant_id/:restaurant_id",
  authenticateToken,
  getScheduleCallsForLead
);
router.get("/all", authenticateToken, getScheduleCallsForKAM);
router.get(
  "/my/call_with_lead_today/:id",
  authenticateToken,
  getCallsWithLeadToday
);
router.get("/my/calls-today", authenticateToken, getCallsForToday);
router.put("/update/:id", authenticateToken, updateCallSchedule);
router.put("/mark-attended/:id", authenticateToken, markCallAttended);
router.delete("/:id", authenticateToken, deleteCallSchedule);

export { router };
