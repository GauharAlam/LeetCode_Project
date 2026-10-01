const Problem = require("../models/problems");
const Submission = require("../models/submission");
const UserStudyPlan = require("../models/userStudyPlan");
const StudyPlan = require("../models/studyPlan");
const { getLanguageById, submitBatch, submitToken, prepareExecutableCode } = require("../utils/problemUtility");

// Send a JSON error, preserving structured Judge0/driver errors when present.
const sendExecutionError = (res, error, fallbackMessage = "Internal server error") => {
  const status = error?.status || 500;
  const message = error?.message || fallbackMessage;
  const payload = { message };
  if (error?.details) {
    payload.details = typeof error.details === "string"
      ? error.details.slice(0, 2000)
      : error.details;
  }
  return res.status(status).json(payload);
};

// Build a readable diagnostic from a Judge0 result (compile error, runtime
// error, wrong answer) so users see *why* it failed, not just "error".
const describeJudgeResult = (result) => {
  const parts = [];
  if (result?.status?.description) parts.push(result.status.description);
  if (result?.compile_output) parts.push(`Compile output:\n${String(result.compile_output).slice(0, 2000)}`);
  if (result?.stderr) parts.push(`Stderr:\n${String(result.stderr).slice(0, 2000)}`);
  if (result?.stdout) parts.push(`Stdout:\n${String(result.stdout).slice(0, 2000)}`);
  return parts.join("\n\n") || "Unknown execution error";
};

const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    const { code, language } = req.body;

    // console.log("helooooo",code);

    if (!userId || !problemId || !code || !language) {
      return res.status(400).json({ message: "Some field missing" });
    }

    const languageId = getLanguageById(language);
    if (!languageId) {
      return res.status(400).json({
        message: `Unsupported language '${language}'. Supported languages: javascript, c++, java.`,
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
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

    let executableCode;
    try {
      executableCode = prepareExecutableCode(code, language);
    } catch (driverErr) {
      submittedResult.status = "error";
      submittedResult.errorMessage = driverErr.message;
      await submittedResult.save();
      return sendExecutionError(res, driverErr);
    }
    const submissions = problem.hiddenTestCases.map((testcase) => ({
      source_code: executableCode,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    // submitBatch/submitToken throw structured errors (502/504/500) on
    // Judge0 outages, missing API key, or timeouts.
    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

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
        submittedResult.errorMessage = describeJudgeResult(result);
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
    return sendExecutionError(res, error);
  }
};

const runCode = async(req, res)=>{
   try {
    const userId = req.result._id;
    const problemId = req.params.id;
    const { code, language } = req.body;

    if (!userId || !problemId || !code || !language) {
      return res.status(400).json({ message: "Some field missing" });
    }

    const languageId = getLanguageById(language);
    if (!languageId) {
      return res.status(400).json({
        message: `Unsupported language '${language}'. Supported languages: javascript, c++, java.`,
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    let executableCode;
    try {
      executableCode = prepareExecutableCode(code, language);
    } catch (driverErr) {
      return sendExecutionError(res, driverErr);
    }
    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: executableCode,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    res.status(201).send(testResult);

  } catch (error) {
    console.error("CRASH IN SUBMITCODE:", error);
    return sendExecutionError(res, error);
  }
}

const getAllSubmissions = async (req, res) => {
  try {
    const userId = req.result._id;

    const submissions = await Submission.find({ userId })
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

module.exports = { submitCode, runCode, getAllSubmissions };
