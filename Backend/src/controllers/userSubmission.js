const Problem = require("../models/problems");
const Submission = require("../models/submission");
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

    // problemId ko insert karenge userSchema ke problemSolved mein if it is not present there

    // req.result == user information
    
    if(!req.result.problemSolved.includes(problemId)){
      req.result.problemSolved.push(problemId);
      await req.result.save();
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