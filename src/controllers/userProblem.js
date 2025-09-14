const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require("../utils/problemUtility");
const Problem = require("../models/problems");

const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
    problemCreator,
  } = req.body;
  try {
    for (const { language, completeCode } of referenceSolution) {
      // source_code:
      // language_id:
      // stdin:
      // expectedOutput:

      const languageId = getLanguageById(language);
      // I am creating Batch submission
      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode, 
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);
      // console.log(submitResult);

      const resultToken = submitResult.map((value) => value.token);
      const testResult = await submitToken(resultToken);
      if (!submitResult) {
        return res.status(500).send("No response from Judge0");
      }

      const submissionsArray = submitResult.submissions || submitResult;

      if (!Array.isArray(submissionsArray)) {
        return res.status(500).send("Invalid response format from Judge0");
      }
      
      for (const result of testResult) {
        if (result.status.id !== 3) {
          return res.status(400).json({
            message: `Test case failed: ${result.status.description}`,
            language: result.language.name,
            status_id: result.status.id,
          });
        }
      }

        try {
          const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id,
          });
          return res.status(201).send("Problem Saved Successfully");
        } catch (er) {
          return res
            .status(500)
            .json({ message: "Something went wrong", error: er });
        }
    }
  }catch(er){
    return res.status(500).json({err:er});
  }
}


const updateProblem = async (req, res) => {

  const{id} = req.params;
  const {
    title,description,difficulty,tags,
    visibleTestCases, hiddenTestCases, startCode,
    referenceSolution, problemCreator,
  } = req.body;

  try{

      if(!id){
    res.status(400).send("Missing id filled");
  }
  const DsaProblem = await Problem.findById(id);
  if(!DsaProblem){
    return res.status(404).send("Id is not present in server");
  }

    for (const { language, completeCode } of referenceSolution) {
      // source_code:
      // language_id:
      // stdin:
      // expectedOutput:

      const languageId = getLanguageById(language);

      // I am creating Batch submission
      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode, 
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);
      // console.log(submitResult);

      const resultToken = submitResult.map((value) => value.token);

      // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

      const testResult = await submitToken(resultToken);

      //  console.log(testResult);

      // console.log(testResult)
      for (const test of testResult) {
        if (test.status_id != 3) {
          return res.status(400).send("Error Occured");
        }
      }
    }

    const newProblem = await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});
    res.status(200).send(newProblem);
  } catch (err) {
    res.status(404).send("Error"+err);
  }
};


// const updateProblem = async (req, res) => {
//   const {id} = req.params;
//   const {
//     title,
//     description,
//     difficulty,
//     tags,
//     visibleTestCases,
//     hiddenTestCases,
//     startCode,
//     referenceSolution,
//     problemCreator,
//   } = req.body;
//   try {
//     for (const { language, completeCode } of referenceSolution) {

//       const languageId = getLanguageById(language);
//       // I am creating Batch submission
//       const submissions = visibleTestCases.map((testcase) => ({
//         source_code: completeCode,
//         language_id: languageId,
//         stdin: testcase.input,
//         expected_output: testcase.output,
//       }));

//       // console.log(submissions,"sumission");

//       const submitResult = await submitBatch(submissions);

//       if (!submitResult) {
//         return res.status(500).send("No response from Judge0");
//       }

//       const submissionsArray = submitResult.submissions || submitResult;

//       if (!Array.isArray(submissionsArray)) {
//         return res.status(500).send("Invalid response format from Judge0");
//       }

//       const resultToken = submissionsArray.map((v) => v.token);


//       const testResult = await submitToken(resultToken);

//       let statusCode = testResult.map(test=> test.status_id);  //[1,2,3,4,..]
      
//       if (statusCode.includes(3)) {
//         // We can update it in our DB
//         try {
//         const newProblem = await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});
//         return res.status(200).json({message:"Problem is updated"});
//         } catch (er) {
//           return res
//             .status(500)
//             .json({ message: "Something went wrong", error: er });
//         }
//       }
//     }
//   } catch (err) {
//     res.status(400).send("Error: " + err);
//   }
// };

// const deleteProblem = async(req,res)=>{

//   const {id} = req.params;

//   try{
//     if(!id){
//       return res.status(400).send("ID is Missing");
//     }

//     const deletedProblem = await Problem.findByIdAndDelete(id);

//     if(!deleteProblem){
//       res.status(404).send("Problem is Missing");
//     }

//     res.status(200).send("Deleted Succesfully");
//   }
//   catch(err){
//     res.status(500).send("Error"+err);
//   }
// };

// const getProblemById = async(req,res)=>{

//   const {id} = req.params;

//   try{
//     if(!id){
//       res.status(400).send("ID is Missing");
//     }

//     const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution');

//     if(!getProblem){
//       res.status(404).send("Problem is Missing");
//     }

//     res.status(200).send(getProblem);
//   }
//   catch(err){
//     res.status(500).send("Error"+err);
//   }

// }

// const getAllProblem = async(req,res)=>{

//   try{
//   const allProbem = await Problem.find({}).select('_id title difficulty tags');

//   if(allProbem.length===0){
//     res.status(404).send("Problems is Missing");
//   }

//   res.status(200).send(allProbem);
//   }
//   catch(err){
//     res.status(500).send("Error"+err);
//   }

// };

// const solvedAllProblemByUser  = async(req,res)=>{

// }

module.exports = { createProblem,updateProblem};
