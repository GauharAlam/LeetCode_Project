const Problem = require("../models/problems");
const Submission = require("../models/submission");
const UserStudyPlan = require("../models/userStudyPlan");
const StudyPlan = require("../models/studyPlan");
const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");

const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    const { code, language } = req.body;

    // console.log("helooooo",code);
    
    if (!userId || !problemId || !code || !language) {
      return res.status(400).send("Some field missing");
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).send("Problem not found");
    }

    // **FIX: Corrected variable name**
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
      testCasesTotal: problem.hiddenTestCases.length,
    });

    // Increment submission count
    problem.submissionCount = (problem.submissionCount || 0) + 1;
    await problem.save();

    const languageId = getLanguageById(language);
    const submissions = problem.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);
    if (!submitResult) {
      return res.status(500).send("No response from Judge0 during submission.");
    }

    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);
    if (!testResult) {
      return res.status(500).send("No response from Judge0 when fetching results.");
    }

    let testCasesPassed = 0;
    let totalRuntime = 0;
    let maxMemory = 0;

    for (const result of testResult) {
      if (result.status.id === 3) { // Accepted
        testCasesPassed++;
        totalRuntime += parseFloat(result.time);
        maxMemory = Math.max(maxMemory, result.memory);
      } else {
        const status = result.status.id === 4 ? 'wrong' : 'error';
        submittedResult.status = status;
        submittedResult.errorMessage = result.status.description;
        submittedResult.testCasesPassed = testCasesPassed;
        await submittedResult.save();
        return res.status(200).send(submittedResult);
      }
    }

    submittedResult.status = 'accepted';
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.runtime = totalRuntime;
    submittedResult.memory = maxMemory;
    await submittedResult.save();

    // Increment accepted count
    problem.acceptedCount = (problem.acceptedCount || 0) + 1;
    await problem.save();

    // problemId ko insert karenge userSchema ke problemSolved mein if it is not present there

    // req.result == user information
    
    if(!req.result.problemSolved.includes(problemId)){
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    // Auto-update study plan progress
    try {
      const enrollments = await UserStudyPlan.find({ userId, status: 'active' });
      for (const enrollment of enrollments) {
        const plan = await StudyPlan.findById(enrollment.studyPlanId);
        if (!plan) continue;

        // Check if this problem is in this plan
        const problemInPlan = plan.days.some(day =>
          day.problems.some(pid => pid.toString() === problemId)
        );
        if (!problemInPlan) continue;

        // Check if already marked solved
        const alreadySolved = enrollment.solvedProblems.some(
          sp => sp.problemId.toString() === problemId
        );
        if (alreadySolved) continue;

        // Mark as solved
        enrollment.solvedProblems.push({ problemId, solvedAt: new Date() });

        // Update current day
        for (const day of plan.days) {
          if (day.problems.some(pid => pid.toString() === problemId)) {
            if (day.dayNumber > enrollment.currentDay) {
              enrollment.currentDay = day.dayNumber;
            }
            break;
          }
        }

        // Check if plan is completed
        const totalProblems = plan.days.reduce((sum, day) => sum + day.problems.length, 0);
        if (enrollment.solvedProblems.length >= totalProblems) {
          enrollment.status = 'completed';
          enrollment.completedAt = new Date();
        }

        await enrollment.save();
      }
    } catch (planErr) {
      console.error("Study plan progress update error (non-blocking):", planErr);
    }

    res.status(201).send(submittedResult);

  } catch (error) {
    console.error("CRASH IN SUBMITCODE:", error);
    res.status(500).send("Internal server error");
  }
};

const runCode = async(req, res)=>{
   try {
    const userId = req.result._id;
    const problemId = req.params.id;
    const { code, language } = req.body;
    
    if (!userId || !problemId || !code || !language) {
      return res.status(400).send("Some field missing");
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).send("Problem not found");
    }

    const languageId = getLanguageById(language);
    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);
    if (!submitResult) {
      return res.status(500).send("No response from Judge0 during submission.");
    }

    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);
    if (!testResult) {
      return res.status(500).send("No response from Judge0 when fetching results.");
    }

    res.status(201).send(testResult);

  } catch (error) {
    console.error("CRASH IN SUBMITCODE:", error);
    res.status(500).send("Internal server error");
  }
}

module.exports = {submitCode,runCode};