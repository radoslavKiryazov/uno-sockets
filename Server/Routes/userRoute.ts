import express from "express";
import { test } from "../Controller/UserController";

const router = express.Router();

router.get("/test", test);

export default router;
