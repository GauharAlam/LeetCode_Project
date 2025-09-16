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

    // now   ready to submit code to judge0
    const languageId = getLanguageById(language);
    const submissions = req.body.visibleTestCases.map((testcase) => ({
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
    let  memory =0;
    let status = 'accepted';
    let erroMessage = null;

    for(const test of testResult){
        if(test.status_id==3){
            testCasesPassed++;
            runtime = runtime+parseFloat(test.time);
            memory = Math.max(memory,test.memory);
        }
        else{
            if(test.status_id==4){
                status = 'error';
                erroMessage = test.stderr;
            }
            else{
                status = 'wrong';
                erroMessage = test.stderr;
            }
        }
    }

    // Now you can store result in database in submission
    submmitedResult.status = status;
    submmitedResult.testCasesPassed = testCasesPassed;
    submmitedResult.errorMessage = erroMessage;
    submmitedResult.runtime = runtime;
    submmitedResult.memory = memory;
    
    await submmitedResult.save();

    res.status(201).send(submmitedResult);

  }
  catch (error) {
        res.status(500).send("Internal server error");
  }
};

module.exports = submitCode;
