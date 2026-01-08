const axios = require("axios");
require("dotenv").config();

const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    java: 62,
    javascript: 63,
  };

  return language[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "false",
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE0_API_KEY, // Use environment variables for API keys
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: { submissions },
  };

  try {
    const response = await axios.request(options);
    console.log("Judge0 Response >>>", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Error in submitBatch:", error.response ? error.response.data : error.message);
    return null;
  }
};

const waiting = (timer) => {
  return new Promise((resolve) => setTimeout(resolve, timer));
};

const submitToken = async (resultToken) => {
  const options = {
    method: "GET",
    url: `https://judge0-ce.p.rapidapi.com/submissions/batch`,
    params: {
      tokens: resultToken.join(","), // Join tokens into a single string
      base64_encoded: "false",
      fields: "*",
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE0_API_KEY, // Use environment variables for API keys
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error("Error in submitToken:", error.response ? error.response.data : error.message);
      return null;
    }
  }

  const MAX_RETRIES = 30; // Maximum 30 seconds timeout
  let retries = 0;

  while (retries < MAX_RETRIES) {
    const result = await fetchData();

    if (!result) {
      retries++;
      await waiting(1000);
      continue;
    }

    // Judge0 returns results inside `submissions` array
    const isResultObtained = result.submissions.every(
      (r) => r.status?.id > 2 // use optional chaining to be safe
    );

    if (isResultObtained) return result.submissions;

    retries++;
    await waiting(1000);
  }

  throw new Error("Judge0 request timeout - maximum retries exceeded");
};

module.exports = { getLanguageById, submitBatch, submitToken };