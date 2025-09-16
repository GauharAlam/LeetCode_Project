const Problem = require("../models/problems");
const Submission = require("../models/submission");
const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");

const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    const { code, language } = req.body;

    if (!userId || !problemId || !code || !language)
      return res.status(400).send("Some field missing");

    // fetch the problem from database
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).send("Problem not found");
    // testcases(hidden)

    const submmitedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
      testCasesTotal: problem.hiddenTestCases.length,
    });

    // now ready to submit code to judge0
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
      return res
        .status(500)
        .send("No response from Judge0 when fetching results.");
    }

    // Submitted result ko update kro 
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) { // 3: Accepted
        testCasesPassed++;
        runtime += parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4) { // 4: Wrong Answer
          status = 'wrong';
        } else { // All other statuses are errors (Compilation, Runtime, etc.)
          status = 'error';
        }
        // Use a more descriptive error message
        errorMessage = test.status.description;
        // Break the loop on the first failed test case
        break;
      }
    }

    // Now you can store result in database in submission
    submmitedResult.status = status;
    submmitedResult.testCasesPassed = testCasesPassed;
    submmitedResult.errorMessage = errorMessage;
    submmitedResult.runtime = runtime;
    submmitedResult.memory = memory;

    await submmitedResult.save();

    res.status(201).send(submmitedResult);

  }
catch (error) {
  console.error("CRASH IN SUBMITCODE:", error);
  res.status(500).send("Internal server error");
}
};

module.exports = submitCode;
