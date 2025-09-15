const express = require("express")
const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware")
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser} = require("../controllers/userProblem");
const userMiddleware = require("../middleware/userMiddleware");

// create
// fetch
// update
// delete
// no of problem solved by user

// Only admin can operate on these 
problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);

// This is for user 
problemRouter.get("/problemById/:id",userMiddleware, getProblemById);
problemRouter.get("/getAllProblem",userMiddleware, getAllProblem);
problemRouter.get("/problemSolvedByUser",userMiddleware, solvedAllProblemByUser);


module.exports = problemRouter;
