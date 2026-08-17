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

/**
 * Prepares user code for execution by injecting the hidden runner/driver
 * if the user wrote a pure LeetCode-style solution function/class without I/O boilerplate.
 */
const prepareExecutableCode = (code, language) => {
  if (!code) return code;
  const lang = (language || "").toLowerCase();

  if (lang === "javascript") {
    // If the code already has manual stdin reader, pass through directly
    if (code.includes("readFileSync") || code.includes("require('fs')")) {
      return code;
    }

    // Wrap with hidden driver
    return `
const fs = require('fs');
const __rawInput = fs.readFileSync(0, 'utf8').trim();
let input;
try {
  input = JSON.parse(__rawInput);
} catch (e) {
  input = __rawInput;
}

// User Code
${code}

// Execution Driver
if (typeof solve === 'function') {
  const __res = solve(input);
  if (__res !== undefined) {
    console.log(typeof __res === 'object' ? JSON.stringify(__res) : __res);
  }
} else if (typeof Solution !== 'undefined') {
  const __inst = new Solution();
  const __methods = Object.getOwnPropertyNames(Solution.prototype).filter(m => m !== 'constructor');
  if (__methods.length > 0 && typeof __inst[__methods[0]] === 'function') {
    const __res = __inst[__methods[0]](input);
    if (__res !== undefined) {
      console.log(typeof __res === 'object' ? JSON.stringify(__res) : __res);
    }
  }
}
`;
  }

  return code;
};

module.exports = { getLanguageById, submitBatch, submitToken, prepareExecutableCode };