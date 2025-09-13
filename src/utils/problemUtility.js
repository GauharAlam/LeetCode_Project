const axios = require("axios");

const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    "java": 62,
    "javascript": 63
  };

  return language[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {
  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: { base64_encoded: 'false' },
    headers: {
      'x-rapidapi-key': '3206ac34cfmsh703c172366c2731p198955jsn86c77fb88bff',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: { submissions }
  };

 async function fetchData() {
  try {
    const response = await axios.request(options);
    console.log("Judge0 Response >>>", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log("Error in submitBatch >>>", error.response?.data || error.message);
    return null;
  }
}


  return await fetchData();
};


const waiting = (timer) => {
  return new Promise((resolve) => setTimeout(resolve, timer));
};

const submitToken = async (resultToken) => {
  const options = {
    method: "GET",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      tokens: resultToken.join(","), // join tokens into a single string
      base64_encoded: "false",
      fields: "*",
    },
    headers: {
      "x-rapidapi-key": "3206ac34cfmsh703c172366c2731p198955jsn86c77fb88bff",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data; // FIX: return the data
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  while (true) {
    const result = await fetchData();

    if (!result) {
      await waiting(1000);
      continue;
    }

    // Judge0 returns results inside `submissions` array
    const isResultObtained = result.submissions.every(
      (r) => r.status?.id > 2 // use optional chaining to be safe
    );

    if (isResultObtained) return result.submissions;

    await waiting(1000);
  }
};


module.exports = { getLanguageById, submitBatch, submitToken };
