const Discussion = require('../models/discussion');

// Create a new discussion
const createDiscussion = async (req, res) => {
    try {
        const userId = req.result._id;
        const { problemId, title, content, tags } = req.body;

        if (!problemId || !title || !content) {
            return res.status(400).json({ message: "Problem ID, title, and content are required" });
        }

        const discussion = await Discussion.create({
            problemId,
            userId,
            title,
            content,
            tags: tags || ['other']
        });

        await discussion.populate('userId', 'firstName');
        res.status(201).json(discussion);
    } catch (error) {
        console.error("Create discussion error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get discussions for a problem
const getDiscussions = async (req, res) => {
    try {
        const { problemId } = req.params;
        const { sort = 'newest' } = req.query;

        let sortOption = { createdAt: -1 };
        if (sort === 'popular') {
            sortOption = { upvotes: -1, createdAt: -1 };
        }

        const discussions = await Discussion.find({ problemId })
            .populate('userId', 'firstName')
            .populate('replies.userId', 'firstName')
            .sort(sortOption)
            .limit(50);

        res.status(200).json(discussions);
    } catch (error) {
        console.error("Get discussions error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Add reply to discussion
const addReply = async (req, res) => {
    try {
        const userId = req.result._id;
        const { discussionId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        const discussion = await Discussion.findByIdAndUpdate(
            discussionId,
            {
                $push: {
                    replies: { userId, content }
                }
            },
            { new: true }
        ).populate('replies.userId', 'firstName');

        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" });
        }

        res.status(200).json(discussion);
    } catch (error) {
        console.error("Add reply error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Upvote/downvote discussion
const toggleUpvote = async (req, res) => {
    try {
        const userId = req.result._id;
        const { discussionId } = req.params;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" });
        }

        const hasUpvoted = discussion.upvotes.includes(userId);

        if (hasUpvoted) {
            discussion.upvotes.pull(userId);
        } else {
            discussion.upvotes.push(userId);
        }

        await discussion.save();
        res.status(200).json({
            upvotes: discussion.upvotes.length,
            hasUpvoted: !hasUpvoted
        });
    } catch (error) {
        console.error("Toggle upvote error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { createDiscussion, getDiscussions, addReply, toggleUpvote };
