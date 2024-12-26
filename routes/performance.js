import { Router } from "express";
import {
  getAllPerformances,
  getPerformance,
  updatePerformance,
  getOrderingPatterns,
  getTopPerformingAccounts,
  getUnderperformingAccounts,
  getTopPerformingAccountsUnderKAM,
  getUnderperformingAccountsUnderKAM,
} from "../controllers/performance.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = Router();

router.get("/restaurant_id/:restaurant_id", authenticateToken, getPerformance);

router.get(
  "/ordering-pattern/:restaurant_id",
  authenticateToken,
  getOrderingPatterns
);

router.get(
  "/top-performing-accounts",
  authenticateToken,
  getTopPerformingAccounts
);

router.get(
  "/under-me/top-performing-accounts",
  authenticateToken,
  getTopPerformingAccountsUnderKAM
);

router.get(
  "/under-performing-accounts",
  authenticateToken,
  getUnderperformingAccounts
);

router.get(
  "/under-me/under-performing-accounts",
  authenticateToken,
  getUnderperformingAccountsUnderKAM
);

router.get("/all", authenticateToken, getAllPerformances);

router.put("/:restaurant_id", authenticateToken, updatePerformance);

export { router };
