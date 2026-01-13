const express = require("express")
const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware")
const { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblemByUser, submittedProblem } = require("../controllers/userProblem");
const { getUserDashboard, getUserProfile, updateUserProfile } = require("../controllers/dashboardController");
const { addBookmark, removeBookmark, getBookmarks, isBookmarked } = require("../controllers/bookmarkController");
const { getLeaderboard, getUserRank } = require("../controllers/leaderboardController");
const { getDailyChallenge } = require("../controllers/dailyChallengeController");
const { createDiscussion, getDiscussions, addReply, toggleUpvote } = require("../controllers/discussionController");
const { getContests, getContest, joinContest, getContestLeaderboard, createContest } = require("../controllers/contestController");
const { getAIHint } = require("../controllers/aiController");
const userMiddleware = require("../middleware/userMiddleware");

// Only admin can operate on these 
problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);

// Dashboard and Profile routes
problemRouter.get("/dashboard", userMiddleware, getUserDashboard);
problemRouter.get("/profile", userMiddleware, getUserProfile);
problemRouter.put("/profile", userMiddleware, updateUserProfile);

// Bookmark routes
problemRouter.post("/bookmark", userMiddleware, addBookmark);
problemRouter.delete("/bookmark/:problemId", userMiddleware, removeBookmark);
problemRouter.get("/bookmarks", userMiddleware, getBookmarks);
problemRouter.get("/bookmark/:problemId", userMiddleware, isBookmarked);

// Leaderboard routes
problemRouter.get("/leaderboard", userMiddleware, getLeaderboard);
problemRouter.get("/rank", userMiddleware, getUserRank);

// Daily Challenge route
problemRouter.get("/daily-challenge", userMiddleware, getDailyChallenge);

// Discussion routes
problemRouter.post("/discussion", userMiddleware, createDiscussion);
problemRouter.get("/discussions/:problemId", userMiddleware, getDiscussions);
problemRouter.post("/discussion/:discussionId/reply", userMiddleware, addReply);
problemRouter.post("/discussion/:discussionId/upvote", userMiddleware, toggleUpvote);

// Contest routes
problemRouter.get("/contests", userMiddleware, getContests);
problemRouter.get("/contest/:contestId", userMiddleware, getContest);
problemRouter.post("/contest/:contestId/join", userMiddleware, joinContest);
problemRouter.get("/contest/:contestId/leaderboard", userMiddleware, getContestLeaderboard);
problemRouter.post("/contest", adminMiddleware, createContest);

// AI Hints route
problemRouter.post("/ai-hint", userMiddleware, getAIHint);

// Problem routes for user 
problemRouter.get("/problemById/:id", userMiddleware, getProblemById);
problemRouter.get("/getAllProblem", userMiddleware, getAllProblem);
problemRouter.get("/problemSolvedByUser", userMiddleware, solvedAllProblemByUser);
problemRouter.get("/submittedProblem/:pid", userMiddleware, submittedProblem);

module.exports = problemRouter;

