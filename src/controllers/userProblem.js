const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require("../utils/problemUtility");
const Problem = require("../models/problems");
const User = require("../models/user");
const Submission = require("../models/submission");


const createProblem = async (req, res) => {
  const { referenceSolution } = req.body;

  try {
    // STEP 1: Loop through and validate ALL solutions first.
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      const submissions = req.body.visibleTestCases.map((testcase) => ({
        source_code: completeCode,
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

      for (const result of testResult) {
        // If ANY test case for ANY language fails, return an error immediately.
        if (result.status.id !== 3) { // 3 = Accepted
          return res.status(400).json({
            message: `The reference solution for '${language}' failed a test case.`,
            details: result.status.description,
          });
        }
      }
    }

    // STEP 2: If the loop completes without returning, all solutions are valid. Now, save the problem.
    const userProblem = await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    return res.status(201).send("Problem Saved Successfully");

  } catch (err) {
    return res.status(500).json({ message: "An unexpected error occurred.", error: err.message });
  }
};

const updateProblem = async (req, res) => {
  const { id } = req.params;
  const { referenceSolution } = req.body;

  try {
    // Check if the problem exists before doing anything else
    const dsaProblem = await Problem.findById(id);
    if (!dsaProblem) {
      return res.status(404).send("A problem with this ID was not found.");
    }

    // STEP 1: Loop through and validate ALL solutions first.
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      const submissions = req.body.visibleTestCases.map((testcase) => ({
        source_code: completeCode,
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

      for (const result of testResult) {
        // If ANY test case for ANY language fails, return an error immediately.
        if (result.status.id !== 3) { // 3 = Accepted
          return res.status(400).json({
            message: `The updated reference solution for '${language}' failed a test case.`,
            details: result.status.description,
          });
        }
      }
    }

    // STEP 2: If the loop completes, all solutions are valid. Now, update the problem.
    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      { ...req.body },
      { runValidators: true, new: true }
    );

    res.status(200).send(updatedProblem);

  } catch (err) {
    res.status(500).json({ message: "An unexpected error occurred during the update.", error: err.message });
  }
};

const deleteProblem = async(req,res)=>{

  const {id} = req.params;

  try{
    if(!id){
      return res.status(400).send("ID is Missing");
    }

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if(!deleteProblem){
      res.status(404).send("Problem is Missing");
    }

    res.status(200).send("Deleted Succesfully");
  }
  catch(err){
    res.status(500).send("Error"+err);
  }
};

const getProblemById = async(req,res)=>{

  const {id} = req.params;

  try{
    if(!id){
      res.status(400).send("ID is Missing");
    }

    const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution');

    if(!getProblem){
      res.status(404).send("Problem is Missing");
    }

    res.status(200).send(getProblem);
  }
  catch(err){
    res.status(500).send("Error"+err);
  }

}

const getAllProblem = async(req,res)=>{

  try{
  const allProbem = await Problem.find({}).select('_id title difficulty tags');

  if(allProbem.length===0){
    res.status(404).send("Problems is Missing");
  }

  res.status(200).send(allProbem);
  }
  catch(err){
    res.status(500).send("Error"+err);
  }

};

const solvedAllProblemByUser  = async(req,res)=>{

  try {
    const userId = req.result._id;
    
    const user = await User.findById(userId).populate({
      path:"problemSolved",
      select:"_id title difficulty tags"
    })

    res.status(200).send(user.problemSolved);
  }
  catch (error) {
    res.status(500).send("Server Error")
  }

}

const submittedProblem = async(req,res)=>{
  try{
    const userId = req.result._id;
    const problemId = req.params.pid;

    const ans = await Submission.find(userId,problemId);

    if(ans.length==0)
      res.status(200).send("NO Submission is Present");


    res.status(200).send(ans);
  }
  catch(err){
    res.status(500).send("Internal Server Error"+err);
  }
}

module.exports = { createProblem, updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser,submittedProblem };
