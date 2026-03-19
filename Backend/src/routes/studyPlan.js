const express = require("express");
const studyPlanRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
    getAllStudyPlans,
    getStudyPlanById,
    enrollInPlan,
    unenrollFromPlan,
    markProblemSolved,
    getMyPlans,
    createStudyPlan,
    updateStudyPlan,
    deleteStudyPlan
} = require("../controllers/studyPlanController");

// Public-ish routes (need auth to see enrollment status)
studyPlanRouter.get("/all", userMiddleware, getAllStudyPlans);
studyPlanRouter.get("/my-plans", userMiddleware, getMyPlans);
studyPlanRouter.get("/:planId", userMiddleware, getStudyPlanById);

// Enrollment
studyPlanRouter.post("/:planId/enroll", userMiddleware, enrollInPlan);
studyPlanRouter.delete("/:planId/enroll", userMiddleware, unenrollFromPlan);

// Progress tracking
studyPlanRouter.post("/:planId/solved/:problemId", userMiddleware, markProblemSolved);

// CRUD (users can create custom, admins create official)
studyPlanRouter.post("/create", userMiddleware, createStudyPlan);
studyPlanRouter.put("/:planId", userMiddleware, updateStudyPlan);
studyPlanRouter.delete("/:planId", userMiddleware, deleteStudyPlan);

module.exports = studyPlanRouter;
