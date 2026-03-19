const StudyPlan = require("../models/studyPlan");
const UserStudyPlan = require("../models/userStudyPlan");
const Problem = require("../models/problems");

// Get all study plans (official + public custom)
const getAllStudyPlans = async (req, res) => {
    try {
        const userId = req.result?._id;
        
        const plans = await StudyPlan.find({
            $or: [
                { isOfficial: true },
                { isPublic: true },
                { createdBy: userId }
            ]
        })
        .populate("createdBy", "firstName lastName")
        .sort({ isOfficial: -1, createdAt: -1 });

        // Get user's enrollment status for each plan
        let userEnrollments = [];
        if (userId) {
            userEnrollments = await UserStudyPlan.find({ userId });
        }

        const plansWithProgress = plans.map(plan => {
            const enrollment = userEnrollments.find(
                e => e.studyPlanId.toString() === plan._id.toString()
            );
            
            // Calculate total problems in plan
            const totalProblems = (plan.days || []).reduce((sum, day) => sum + (day.problems || []).length, 0);
            
            return {
                ...plan.toObject(),
                isEnrolled: !!enrollment,
                enrollmentStatus: enrollment?.status || null,
                solvedCount: enrollment?.solvedProblems?.length || 0,
                totalProblems,
                currentDay: enrollment?.currentDay || 0,
                startedAt: enrollment?.startedAt || null,
                completedAt: enrollment?.completedAt || null
            };
        });

        res.status(200).json(plansWithProgress);
    } catch (error) {
        console.error("Get study plans error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get a single study plan with full details
const getStudyPlanById = async (req, res) => {
    try {
        const { planId } = req.params;
        const userId = req.result?._id;

        const plan = await StudyPlan.findById(planId)
            .populate("createdBy", "firstName lastName")
            .populate("days.problems", "title difficulty tags");

        if (!plan) {
            return res.status(404).json({ message: "Study plan not found" });
        }

        // Get user's enrollment
        let enrollment = null;
        if (userId) {
            enrollment = await UserStudyPlan.findOne({ userId, studyPlanId: planId });
        }

        const totalProblems = (plan.days || []).reduce((sum, day) => sum + (day.problems || []).length, 0);

        res.status(200).json({
            ...plan.toObject(),
            isEnrolled: !!enrollment,
            enrollmentStatus: enrollment?.status || null,
            solvedCount: enrollment?.solvedProblems?.length || 0,
            solvedProblems: enrollment?.solvedProblems?.map(sp => sp.problemId.toString()) || [],
            totalProblems,
            currentDay: enrollment?.currentDay || 0,
            startedAt: enrollment?.startedAt || null,
            completedAt: enrollment?.completedAt || null
        });
    } catch (error) {
        console.error("Get study plan error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Enroll in a study plan
const enrollInPlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const userId = req.result._id;

        // Check if plan exists
        const plan = await StudyPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: "Study plan not found" });
        }

        // Check if already enrolled
        const existing = await UserStudyPlan.findOne({ userId, studyPlanId: planId });
        if (existing) {
            return res.status(400).json({ message: "Already enrolled in this plan" });
        }

        const userPlan = new UserStudyPlan({
            userId,
            studyPlanId: planId,
            currentDay: 1
        });

        await userPlan.save();

        // Increment enrolled count
        await StudyPlan.findByIdAndUpdate(planId, { $inc: { enrolledCount: 1 } });

        res.status(201).json({ message: "Successfully enrolled!", userPlan });
    } catch (error) {
        console.error("Enroll error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Unenroll from a study plan
const unenrollFromPlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const userId = req.result._id;

        const deleted = await UserStudyPlan.findOneAndDelete({ userId, studyPlanId: planId });
        if (!deleted) {
            return res.status(404).json({ message: "Not enrolled in this plan" });
        }

        // Decrement enrolled count
        await StudyPlan.findByIdAndUpdate(planId, { $inc: { enrolledCount: -1 } });

        res.status(200).json({ message: "Successfully unenrolled" });
    } catch (error) {
        console.error("Unenroll error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Mark a problem as solved in a study plan
const markProblemSolved = async (req, res) => {
    try {
        const { planId, problemId } = req.params;
        const userId = req.result._id;

        const enrollment = await UserStudyPlan.findOne({ userId, studyPlanId: planId });
        if (!enrollment) {
            return res.status(404).json({ message: "Not enrolled in this plan" });
        }

        // Check if already solved
        const alreadySolved = enrollment.solvedProblems.some(
            sp => sp.problemId.toString() === problemId
        );
        if (alreadySolved) {
            return res.status(400).json({ message: "Problem already marked as solved" });
        }

        enrollment.solvedProblems.push({ problemId, solvedAt: new Date() });

        // Check if all problems in the plan are solved
        const plan = await StudyPlan.findById(planId);
        const totalProblems = (plan.days || []).reduce((sum, day) => sum + (day.problems || []).length, 0);

        if (enrollment.solvedProblems.length >= totalProblems) {
            enrollment.status = "completed";
            enrollment.completedAt = new Date();
        }

        // Update current day based on day of the latest solved problem
        for (const day of (plan.days || [])) {
            const dayProblemIds = (day.problems || []).map(p => p.toString());
            if (dayProblemIds.includes(problemId)) {
                if (day.dayNumber > enrollment.currentDay) {
                    enrollment.currentDay = day.dayNumber;
                }
                break;
            }
        }

        await enrollment.save();

        res.status(200).json({
            message: "Problem marked as solved!",
            solvedCount: enrollment.solvedProblems.length,
            totalProblems,
            isCompleted: enrollment.status === "completed"
        });
    } catch (error) {
        console.error("Mark solved error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get user's enrolled plans with progress
const getMyPlans = async (req, res) => {
    try {
        const userId = req.result._id;

        const enrollments = await UserStudyPlan.find({ userId })
            .populate({
                path: "studyPlanId",
                populate: { path: "createdBy", select: "firstName lastName" }
            })
            .sort({ updatedAt: -1 });

        const plansWithProgress = enrollments.map(enrollment => {
            const plan = enrollment.studyPlanId;
            if (!plan) return null;

            const totalProblems = (plan.days || []).reduce((sum, day) => sum + (day.problems || []).length, 0);

            return {
                ...plan.toObject(),
                isEnrolled: true,
                enrollmentStatus: enrollment.status,
                solvedCount: enrollment.solvedProblems.length,
                totalProblems,
                currentDay: enrollment.currentDay,
                startedAt: enrollment.startedAt,
                completedAt: enrollment.completedAt,
                progress: totalProblems > 0
                    ? Math.round((enrollment.solvedProblems.length / totalProblems) * 100)
                    : 0
            };
        }).filter(Boolean);

        res.status(200).json(plansWithProgress);
    } catch (error) {
        console.error("Get my plans error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Create a study plan (admin creates official, users create custom)
const createStudyPlan = async (req, res) => {
    try {
        const userId = req.result._id;
        const userRole = req.result.role;

        const { name, description, difficulty, duration, icon, color, topics, days, isPublic } = req.body;

        if (!name || !description || !difficulty || !duration) {
            return res.status(400).json({ message: "Name, description, difficulty, and duration are required" });
        }

        const plan = new StudyPlan({
            name,
            description,
            difficulty,
            duration,
            icon: icon || "target",
            color: color || "from-blue-500 to-cyan-500",
            topics: topics || [],
            days: days || [],
            isOfficial: userRole === "admin",
            createdBy: userId,
            isPublic: isPublic !== undefined ? isPublic : true
        });

        await plan.save();
        res.status(201).json({ message: "Study plan created!", plan });
    } catch (error) {
        console.error("Create study plan error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update a study plan
const updateStudyPlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const userId = req.result._id;
        const userRole = req.result.role;

        const plan = await StudyPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: "Study plan not found" });
        }

        // Only admin or plan creator can update
        if (userRole !== "admin" && plan.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to update this plan" });
        }

        const allowedUpdates = ["name", "description", "difficulty", "duration", "icon", "color", "topics", "days", "isPublic"];
        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const updatedPlan = await StudyPlan.findByIdAndUpdate(planId, updates, { new: true, runValidators: true });
        res.status(200).json({ message: "Plan updated!", plan: updatedPlan });
    } catch (error) {
        console.error("Update study plan error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete a study plan
const deleteStudyPlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const userId = req.result._id;
        const userRole = req.result.role;

        const plan = await StudyPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: "Study plan not found" });
        }

        // Only admin or plan creator can delete
        if (userRole !== "admin" && plan.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this plan" });
        }

        await StudyPlan.findByIdAndDelete(planId);
        // Clean up user enrollments
        await UserStudyPlan.deleteMany({ studyPlanId: planId });

        res.status(200).json({ message: "Plan deleted!" });
    } catch (error) {
        console.error("Delete study plan error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getAllStudyPlans,
    getStudyPlanById,
    enrollInPlan,
    unenrollFromPlan,
    markProblemSolved,
    getMyPlans,
    createStudyPlan,
    updateStudyPlan,
    deleteStudyPlan
};
