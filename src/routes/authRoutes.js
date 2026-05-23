import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateRegister, validateLogin, validateRequestPasswordReset, validateResetPassword } from "../middlewares/validator.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/refresh-token", refreshToken);
router.post("/refresh", refreshToken);
router.post("/logout", protect, logout);
router.post("/request-password-reset", validateRequestPasswordReset, requestPasswordReset);
router.post("/reset-password", validateResetPassword, resetPassword);

export default router;
