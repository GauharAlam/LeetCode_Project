const Problem = require("../models/problems");
const Submission = require("../models/submission");
const { getLanguageById, submitBatch,submitToken } = require("../utils/problemUtility");

const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    const { code, language } = req.body;

    if (!userId || !problemId || !code || !language)
      return res.status(400).send("Some field mising");

    // fetch the problem from database
    const problem = Problem.findById(problemId);
    // testcases(hidden)

    const submmitedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
      testCasesTotal: problem.hiddenTestCases.length,
    });

    // now   ready to submit code to judge0
    const languageId = getLanguageById(language);
    const submissions = req.body.visibleTestCases.map((testcase) => ({
      source_code: Code,
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

  } catch (error) {}
};

module.exports = submitCode;
