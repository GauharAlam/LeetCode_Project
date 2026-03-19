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

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

// AI-powered study plan recommendation
const getAIRecommendation = async (req, res) => {
    try {
        const userId = req.result._id;
        const User = require("../models/user");
        const Problem = require("../models/problems");

        // Get user data
        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "title difficulty tags"
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get all problems
        const allProblems = await Problem.find({}).select("_id title difficulty tags");

        // Analyze user's strengths and weaknesses
        const solvedTags = {};
        const solvedDifficulty = { easy: 0, medium: 0, hard: 0 };

        user.problemSolved.forEach(p => {
            solvedDifficulty[p.difficulty] = (solvedDifficulty[p.difficulty] || 0) + 1;
            p.tags?.forEach(tag => {
                solvedTags[tag] = (solvedTags[tag] || 0) + 1;
            });
        });

        // Find unsolved problems
        const solvedIds = new Set(user.problemSolved.map(p => p._id.toString()));
        const unsolvedProblems = allProblems.filter(p => !solvedIds.has(p._id.toString()));

        // Count total by tags
        const allTags = {};
        allProblems.forEach(p => {
            p.tags?.forEach(tag => {
                allTags[tag] = (allTags[tag] || 0) + 1;
            });
        });

        // Find weak tags (low solve rate)
        const tagAnalysis = Object.entries(allTags).map(([tag, total]) => ({
            tag,
            total,
            solved: solvedTags[tag] || 0,
            rate: total > 0 ? ((solvedTags[tag] || 0) / total * 100).toFixed(0) : 0
        })).sort((a, b) => a.rate - b.rate);

        const weakTags = tagAnalysis.filter(t => Number(t.rate) < 50).slice(0, 5);
        const strongTags = tagAnalysis.filter(t => Number(t.rate) >= 50);

        // Check if Gemini API is available
        if (!process.env.GEMINI_API_KEY) {
            // Generate fallback recommendation without AI
            const recommendedProblems = unsolvedProblems
                .filter(p => {
                    const weakTagNames = weakTags.map(t => t.tag);
                    return p.tags?.some(tag => weakTagNames.includes(tag));
                })
                .slice(0, 15);

            return res.status(200).json({
                recommendation: {
                    planName: `Focus on ${weakTags.slice(0, 2).map(t => t.tag).join(' & ')}`,
                    description: `Based on your profile, you should focus on ${weakTags.map(t => t.tag).join(', ')}. These are your weakest areas.`,
                    difficulty: "mixed",
                    duration: Math.max(7, recommendedProblems.length),
                    topics: weakTags.map(t => t.tag),
                    suggestedProblems: recommendedProblems.map(p => ({
                        _id: p._id,
                        title: p.title,
                        difficulty: p.difficulty,
                        tags: p.tags
                    }))
                },
                analysis: {
                    totalSolved: user.problemSolved.length,
                    totalProblems: allProblems.length,
                    solvedDifficulty,
                    weakTags,
                    strongTags: strongTags.slice(0, 5)
                },
                aiGenerated: false
            });
        }

        // Use Gemini for intelligent recommendation
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `You are an expert DSA (Data Structures & Algorithms) tutor creating a personalized study plan.

Here is the student's profile:
- Total problems solved: ${user.problemSolved.length} out of ${allProblems.length}
- Easy solved: ${solvedDifficulty.easy}, Medium: ${solvedDifficulty.medium}, Hard: ${solvedDifficulty.hard}
- Weak areas (low solve rate): ${weakTags.map(t => `${t.tag} (${t.rate}% solved)`).join(', ') || 'None identified'}
- Strong areas: ${strongTags.slice(0, 3).map(t => `${t.tag} (${t.rate}% solved)`).join(', ') || 'None yet'}

Available unsolved problems (pick from these):
${unsolvedProblems.slice(0, 30).map(p => `- "${p.title}" [${p.difficulty}] [${p.tags?.join(', ')}]`).join('\n')}

Generate a study plan recommendation in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "planName": "A creative, motivating plan name",
  "description": "2-sentence description of what this plan focuses on and why",
  "difficulty": "easy|medium|hard|mixed",
  "duration": <number of days, 7-30>,
  "topics": ["topic1", "topic2", "topic3"],
  "advice": "2-3 sentences of personalized advice for this student",
  "days": [
    { "dayNumber": 1, "title": "Day theme", "problemTitles": ["exact problem title from the list"] }
  ]
}

Rules:
- Focus on weak areas first, then gradually increase difficulty
- Use EXACT problem titles from the unsolved problems list above
- Create 5-10 days with 1-3 problems each
- Make day titles motivating and descriptive`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let aiText = response.text().trim();

        // Clean up AI response (remove markdown code blocks if present)
        aiText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let aiPlan;
        try {
            aiPlan = JSON.parse(aiText);
        } catch (parseErr) {
            console.error("Failed to parse AI response:", aiText);
            // Return fallback
            const recommendedProblems = unsolvedProblems
                .filter(p => weakTags.some(wt => p.tags?.includes(wt.tag)))
                .slice(0, 15);

            return res.status(200).json({
                recommendation: {
                    planName: `Focus on ${weakTags.slice(0, 2).map(t => t.tag).join(' & ')}`,
                    description: "AI-generated plan had a formatting issue. Here's a curated recommendation based on your weak areas.",
                    difficulty: "mixed",
                    duration: Math.max(7, recommendedProblems.length),
                    topics: weakTags.map(t => t.tag),
                    suggestedProblems: recommendedProblems.map(p => ({
                        _id: p._id, title: p.title, difficulty: p.difficulty, tags: p.tags
                    }))
                },
                analysis: {
                    totalSolved: user.problemSolved.length,
                    totalProblems: allProblems.length,
                    solvedDifficulty,
                    weakTags,
                    strongTags: strongTags.slice(0, 5)
                },
                aiGenerated: false
            });
        }

        // Map AI-suggested problem titles back to actual problem objects
        const suggestedProblems = [];
        const aiDays = [];

        if (aiPlan.days) {
            for (const day of aiPlan.days) {
                const dayProblems = [];
                for (const title of (day.problemTitles || [])) {
                    const match = allProblems.find(p =>
                        p.title.toLowerCase() === title.toLowerCase()
                    );
                    if (match && !solvedIds.has(match._id.toString())) {
                        dayProblems.push({
                            _id: match._id, title: match.title,
                            difficulty: match.difficulty, tags: match.tags
                        });
                        suggestedProblems.push(match);
                    }
                }
                if (dayProblems.length > 0) {
                    aiDays.push({
                        dayNumber: day.dayNumber,
                        title: day.title,
                        problems: dayProblems
                    });
                }
            }
        }

        // If AI didn't match enough, supplement with unsolved weak-area problems
        if (suggestedProblems.length < 5) {
            const supplement = unsolvedProblems
                .filter(p => !suggestedProblems.some(sp => sp._id.toString() === p._id.toString()))
                .filter(p => weakTags.some(wt => p.tags?.includes(wt.tag)))
                .slice(0, 10 - suggestedProblems.length);
            suggestedProblems.push(...supplement);
        }

        res.status(200).json({
            recommendation: {
                planName: aiPlan.planName || "AI Recommended Plan",
                description: aiPlan.description || "A personalized plan based on your profile",
                difficulty: aiPlan.difficulty || "mixed",
                duration: aiPlan.duration || 14,
                topics: aiPlan.topics || weakTags.map(t => t.tag),
                advice: aiPlan.advice || "",
                days: aiDays,
                suggestedProblems: suggestedProblems.map(p => ({
                    _id: p._id, title: p.title, difficulty: p.difficulty, tags: p.tags
                }))
            },
            analysis: {
                totalSolved: user.problemSolved.length,
                totalProblems: allProblems.length,
                solvedDifficulty,
                weakTags,
                strongTags: strongTags.slice(0, 5)
            },
            aiGenerated: true
        });

    } catch (error) {
        console.error("AI recommendation error:", error);

        // Fall back to analysis-based recommendation without AI
        try {
            const userId = req.result._id;
            const User = require("../models/user");
            const Problem = require("../models/problems");

            const user = await User.findById(userId).populate({
                path: "problemSolved",
                select: "title difficulty tags"
            });

            const allProblems = await Problem.find({}).select("_id title difficulty tags");
            const solvedIds = new Set((user?.problemSolved || []).map(p => p._id.toString()));
            const unsolvedProblems = allProblems.filter(p => !solvedIds.has(p._id.toString()));

            const solvedTags = {};
            const solvedDifficulty = { easy: 0, medium: 0, hard: 0 };
            (user?.problemSolved || []).forEach(p => {
                solvedDifficulty[p.difficulty] = (solvedDifficulty[p.difficulty] || 0) + 1;
                p.tags?.forEach(tag => { solvedTags[tag] = (solvedTags[tag] || 0) + 1; });
            });

            const allTags = {};
            allProblems.forEach(p => {
                p.tags?.forEach(tag => { allTags[tag] = (allTags[tag] || 0) + 1; });
            });

            const tagAnalysis = Object.entries(allTags).map(([tag, total]) => ({
                tag, total, solved: solvedTags[tag] || 0,
                rate: total > 0 ? ((solvedTags[tag] || 0) / total * 100).toFixed(0) : 0
            })).sort((a, b) => a.rate - b.rate);

            const weakTags = tagAnalysis.filter(t => Number(t.rate) < 50).slice(0, 5);
            const strongTags = tagAnalysis.filter(t => Number(t.rate) >= 50);

            const recommendedProblems = unsolvedProblems
                .filter(p => weakTags.length === 0 || weakTags.some(wt => p.tags?.includes(wt.tag)))
                .slice(0, 15);

            // Create day-wise breakdown
            const days = [];
            for (let i = 0; i < recommendedProblems.length; i += 2) {
                const dayProblems = recommendedProblems.slice(i, i + 2);
                days.push({
                    dayNumber: days.length + 1,
                    title: `Practice Session ${days.length + 1}`,
                    problems: dayProblems.map(p => ({
                        _id: p._id, title: p.title, difficulty: p.difficulty, tags: p.tags
                    }))
                });
            }

            const planTopics = weakTags.length > 0
                ? weakTags.map(t => t.tag)
                : [...new Set(recommendedProblems.flatMap(p => p.tags || []))].slice(0, 5);

            res.status(200).json({
                recommendation: {
                    planName: weakTags.length > 0
                        ? `Improve ${weakTags.slice(0, 2).map(t => t.tag).join(' & ')}`
                        : "Recommended Practice Plan",
                    description: weakTags.length > 0
                        ? `Focus on your weakest areas: ${weakTags.map(t => t.tag).join(', ')}. Build strong foundations step by step.`
                        : "A curated plan to keep improving your problem-solving skills.",
                    difficulty: "mixed",
                    duration: Math.max(7, days.length),
                    topics: planTopics,
                    advice: `You've solved ${user?.problemSolved?.length || 0} out of ${allProblems.length} problems. ${weakTags.length > 0 ? `Focus on ${weakTags[0].tag} — you've only solved ${weakTags[0].rate}% of problems in that area.` : 'Keep up the great work!'}`,
                    days,
                    suggestedProblems: recommendedProblems.map(p => ({
                        _id: p._id, title: p.title, difficulty: p.difficulty, tags: p.tags
                    }))
                },
                analysis: {
                    totalSolved: user?.problemSolved?.length || 0,
                    totalProblems: allProblems.length,
                    solvedDifficulty,
                    weakTags,
                    strongTags: strongTags.slice(0, 5)
                },
                aiGenerated: false
            });
        } catch (fallbackErr) {
            console.error("Fallback recommendation also failed:", fallbackErr);
            res.status(500).json({ message: "Failed to generate recommendation" });
        }
    }
};

// Create a study plan from AI recommendation
const createPlanFromRecommendation = async (req, res) => {
    try {
        const userId = req.result._id;
        const StudyPlan = require("../models/studyPlan");
        const UserStudyPlan = require("../models/userStudyPlan");

        const { planName, description, difficulty, duration, topics, days } = req.body;

        if (!planName || !description) {
            return res.status(400).json({ message: "Plan name and description are required" });
        }

        // Create the plan
        const plan = new StudyPlan({
            name: planName,
            description,
            difficulty: difficulty || "mixed",
            duration: duration || 14,
            icon: "zap",
            color: "from-purple-500 to-pink-500",
            topics: topics || [],
            days: (days || []).map(d => ({
                dayNumber: d.dayNumber,
                title: d.title || "",
                problems: d.problems?.map(p => p._id) || []
            })),
            isOfficial: false,
            createdBy: userId,
            isPublic: false
        });

        await plan.save();

        // Auto-enroll the user
        const enrollment = new UserStudyPlan({
            userId,
            studyPlanId: plan._id,
            currentDay: 1
        });
        await enrollment.save();

        plan.enrolledCount = 1;
        await plan.save();

        res.status(201).json({ message: "Plan created and enrolled!", plan });
    } catch (error) {
        console.error("Create from recommendation error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// AI Code Fix and Analysis
const getAIFix = async (req, res) => {
    try {
        const { problemTitle, problemDescription, userCode, language } = req.body;

        if (!problemTitle || !userCode) {
            return res.status(400).json({ message: "Problem title and code are required for analysis." });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({
                message: "AI agent is offline. Please configure GEMINI_API_KEY."
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `You are an expert pair-programming AI agent for a LeetCode clone.
A user wrote the following ${language || 'code'} for the problem "${problemTitle}".

Problem Description:
${problemDescription.slice(0, 1000)}

User Code:
\`\`\`${language || 'text'}
${userCode.slice(0, 3000)}
\`\`\`

Task:
Analyze the code for syntax errors, logical bugs, and time/space complexity issues.
1. Provide constructive feedback (be encouraging but direct).
2. Provide the fully corrected, optimized version of their code. Keep the same core logic if possible, just fix the bugs. If their logic is completely wrong, provide the standard optimal solution.

Output EXACTLY in the following JSON format (do not use markdown blocks around the JSON):
{
    "feedback": "Your explanation of the bugs and what needs fixing...",
    "fixedCode": "The complete functioning code as a string"
}
`;

        const result = await model.generateContent(prompt);
        let aiText = result.response.text().trim();
        aiText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const parsedResponse = JSON.parse(aiText);
        
        res.status(200).json(parsedResponse);
    } catch (error) {
        console.error("AI fix error:", error);
        res.status(500).json({ message: "Failed to analyze code at this time.", error: error.message });
    }
};

// Conversational AI Chat
const chatWithAI = async (req, res) => {
    try {
        const { problemTitle, problemDescription, userCode, language, chatHistory, userMessage } = req.body;

        if (!userMessage) {
            return res.status(400).json({ message: "Message is required." });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({
                message: "AI agent is offline. Please configure GEMINI_API_KEY."
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Build the system context
        const systemPrompt = `You are "AlgoForge Agent", an expert programming tutor helping a user solve a coding problem named "${problemTitle}". 
Your goal is to guide them through every line, provide hints, and help them debug, without just giving away the full answer immediately unless they ask for it.

Problem Description:
${problemDescription ? problemDescription.slice(0, 1000) : 'N/A'}

Current User Code (${language || 'unknown'}):
\`\`\`${language || 'text'}
${userCode ? userCode.slice(0, 3000) : 'No code yet.'}
\`\`\`

Instructions:
- Keep your answers concise, friendly, and formatted in Markdown.
- Provide code snippets when helpful.
- Respond directly to the user's latest message below.
`;

        // Format history for Gemini SDK
        const formattedHistory = [];
        if (chatHistory && Array.isArray(chatHistory)) {
            for (const msg of chatHistory) {
                formattedHistory.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                });
            }
        }

        const chatSession = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: 'model',
                    parts: [{ text: "Understood! I will act as the AlgoForge Agent and help the user step-by-step." }]
                },
                ...formattedHistory
            ],
            generationConfig: {
                maxOutputTokens: 1000,
            }
        });

        const result = await chatSession.sendMessage(userMessage);
        const aiResponse = result.response.text();

        res.status(200).json({ reply: aiResponse });
    } catch (error) {
        console.error("AI chat error:", error);
        res.status(500).json({ message: "Failed to communicate with AI.", error: error.message });
    }
};

module.exports = { getAIHint, getAIRecommendation, createPlanFromRecommendation, getAIFix, chatWithAI };

