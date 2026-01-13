const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API (uses env variable GEMINI_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDZ3F5pIwZm_FwnnYLpp3gcxcjnCkYH0yw');

// Get AI hint for a problem
const getAIHint = async (req, res) => {
    try {
        const { problemTitle, problemDescription, difficulty, userCode } = req.body;

        if (!problemTitle || !problemDescription) {
            return res.status(400).json({ message: "Problem title and description are required" });
        }

        // Check if Gemini API key exists
        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({
                message: "AI hints are not available. Please configure GEMINI_API_KEY.",
                fallbackHint: getBasicHint(difficulty)
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a helpful coding tutor. A student is working on this problem:

Problem: ${problemTitle}
Difficulty: ${difficulty || 'unknown'}
Description: ${problemDescription.slice(0, 500)}

${userCode ? `Their current code attempt:\n${userCode.slice(0, 500)}\n` : ''}

Provide a helpful hint to guide them toward the solution WITHOUT giving away the complete answer. Keep the hint concise (2-3 sentences max). Focus on:
1. The key insight or pattern they should recognize
2. A suggested approach or data structure
3. Edge cases to consider

Format: Just provide the hint directly, no additional formatting.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const hint = response.text();

        res.status(200).json({ hint });
    } catch (error) {
        console.error("AI hint error:", error);
        // Provide fallback hint
        res.status(200).json({
            hint: getBasicHint(req.body?.difficulty),
            fallback: true
        });
    }
};

// Basic hints when AI is not available
const getBasicHint = (difficulty) => {
    const hints = {
        easy: "Start by understanding the problem constraints. Consider using basic data structures like arrays or hash maps. Think about the simplest brute force solution first.",
        medium: "Look for patterns in the problem. Consider techniques like two pointers, sliding window, or dynamic programming. Break the problem into smaller subproblems.",
        hard: "This problem likely requires an advanced algorithm or optimization. Consider graph algorithms, advanced DP, or mathematical insights. Analyze time/space complexity carefully."
    };
    return hints[difficulty] || hints.medium;
};

module.exports = { getAIHint };
