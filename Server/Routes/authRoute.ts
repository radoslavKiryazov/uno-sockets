import express from "express";
import { signup, signin, signout } from "../Controller/AuthController";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
// router.post('/google', google);
router.get("/signout", signout);

export default router;
