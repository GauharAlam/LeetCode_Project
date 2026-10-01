const {
  getLanguageById,
  submitBatch,
  submitToken,
  prepareExecutableCode,
} = require("../utils/problemUtility");
const Problem = require("../models/problems");
const User = require("../models/user");
const Submission = require("../models/submission");
const Note = require("../models/note");


const createProblem = async (req, res) => {
  const { referenceSolution } = req.body;

  try {
    // STEP 1: Loop through and validate ALL solutions first.
    // NOTE: validation runs through the same prepareExecutableCode driver as
    // user submissions, so LeetCode-style `class Solution` reference code is
    // accepted (C++/Java are wrapped with the auto-runner).
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);
      if (!languageId) {
        return res.status(400).json({
          message: `Unsupported language '${language}'. Supported languages: javascript, c++, java.`,
        });
      }

      let executableCode;
      try {
        executableCode = prepareExecutableCode(completeCode, language);
      } catch (driverErr) {
        return res.status(driverErr.status || 400).json({
          message: `The reference solution for '${language}' could not be prepared: ${driverErr.message}`,
          details: driverErr.details,
        });
      }

      const submissions = req.body.visibleTestCases.map((testcase) => ({
        source_code: executableCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      let testResult;
      try {
        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((value) => value.token);
        testResult = await submitToken(resultToken);
      } catch (judgeErr) {
        return res.status(judgeErr.status || 502).json({
          message: judgeErr.message || "No response from Judge0 during submission.",
          details: judgeErr.details,
        });
      }

      for (const result of testResult) {
        // If ANY test case for ANY language fails, return an error immediately.
        if (result.status.id !== 3) { // 3 = Accepted
          return res.status(400).json({
            message: `The reference solution for '${language}' failed a test case.`,
            details: [
              result.status.description,
              result.compile_output ? `Compile output:\n${String(result.compile_output).slice(0, 2000)}` : null,
              result.stderr ? `Stderr:\n${String(result.stderr).slice(0, 2000)}` : null,
              result.stdout ? `Stdout:\n${String(result.stdout).slice(0, 2000)}` : null,
            ].filter(Boolean).join("\n\n"),
          });
        }
      }
    }

    // STEP 2: If the loop completes without returning, all solutions are valid. Now, save the problem.
    const userProblem = await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    return res.status(201).json({ message: "Problem Saved Successfully", problem: userProblem });

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
    // (Same driver as submissions — see createProblem.)
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);
      if (!languageId) {
        return res.status(400).json({
          message: `Unsupported language '${language}'. Supported languages: javascript, c++, java.`,
        });
      }

      let executableCode;
      try {
        executableCode = prepareExecutableCode(completeCode, language);
      } catch (driverErr) {
        return res.status(driverErr.status || 400).json({
          message: `The updated reference solution for '${language}' could not be prepared: ${driverErr.message}`,
          details: driverErr.details,
        });
      }

      const submissions = req.body.visibleTestCases.map((testcase) => ({
        source_code: executableCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      let testResult;
      try {
        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((value) => value.token);
        testResult = await submitToken(resultToken);
      } catch (judgeErr) {
        return res.status(judgeErr.status || 502).json({
          message: judgeErr.message || "No response from Judge0 during submission.",
          details: judgeErr.details,
        });
      }

      for (const result of testResult) {
        // If ANY test case for ANY language fails, return an error immediately.
        if (result.status.id !== 3) { // 3 = Accepted
          return res.status(400).json({
            message: `The updated reference solution for '${language}' failed a test case.`,
            details: [
              result.status.description,
              result.compile_output ? `Compile output:\n${String(result.compile_output).slice(0, 2000)}` : null,
              result.stderr ? `Stderr:\n${String(result.stderr).slice(0, 2000)}` : null,
              result.stdout ? `Stdout:\n${String(result.stdout).slice(0, 2000)}` : null,
            ].filter(Boolean).join("\n\n"),
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

const deleteProblem = async (req, res) => {

  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send("ID is Missing");
    }

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem) {
      return res.status(404).send("Problem is Missing");
    }

    res.status(200).send("Deleted Succesfully");
  }
  catch (err) {
    res.status(500).send("Error" + err);
  }
};

const getProblemById = async (req, res) => {

  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send("ID is Missing");
    }

    const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution hints acceptedCount submissionCount constraints');

    if (!getProblem) {
      return res.status(404).send("Problem is Missing");
    }

    res.status(200).send(getProblem);
  }
  catch (err) {
    res.status(500).send("Error" + err);
  }

}

const getAllProblem = async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Problem.countDocuments({});
    const problems = await Problem.find({})
      .select('_id title difficulty tags companies')
      .skip(skip)
      .limit(limit);

    if (problems.length === 0 && page === 1) {
      return res.status(404).send("Problems is Missing");
    }

    res.status(200).json({
      problems,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  }
  catch (err) {
    res.status(500).send("Error" + err);
  }

};

const solvedAllProblemByUser = async (req, res) => {

  try {
    const userId = req.result._id;

    const user = await User.findById(userId).populate({
      path: "problemSolved",
      select: "_id title difficulty tags"
    })

    res.status(200).send(user.problemSolved);
  }
  catch (error) {
    res.status(500).send("Server Error")
  }

}

const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.pid;

    const ans = await Submission.find({ userId, problemId });

    if (ans.length == 0)
      return res.status(200).send("NO Submission is Present");


    res.status(200).send(ans);
  }
  catch (err) {
    res.status(500).send("Internal Server Error" + err);
  }
}

// @desc Get user's note for a specific problem
// @route GET /problem/:id/note
// @access Private
const getNote = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;

        const note = await Note.findOne({ userId, problemId });
        
        if (!note) {
            return res.status(200).json({ content: "" });
        }

        res.status(200).json({ content: note.content });
    } catch (error) {
        console.error("Get note error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Save user's note for a specific problem
// @route POST /problem/:id/note
// @access Private
const saveNote = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        const { content } = req.body;

        let note = await Note.findOne({ userId, problemId });

        if (note) {
            note.content = content || "";
            await note.save();
        } else {
            note = await Note.create({
                userId,
                problemId,
                content: content || ""
            });
        }

        res.status(200).json({ message: "Note saved successfully", content: note.content });
    } catch (error) {
        console.error("Save note error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblemByUser, submittedProblem, getNote, saveNote };
