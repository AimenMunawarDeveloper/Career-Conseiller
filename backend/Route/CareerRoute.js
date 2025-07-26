import express from "express";
import { getAllSkills, getJobsInformation } from "../Controller/Career.js";

const router = express.Router();
router.get("/developer-jobs", getJobsInformation);
router.get("/skills", getAllSkills);
export default router;
