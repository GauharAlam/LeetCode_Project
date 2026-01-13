const Bookmark = require('../models/bookmark');

// Add bookmark
const addBookmark = async (req, res) => {
    try {
        const userId = req.result._id;
        const { problemId } = req.body;

        if (!problemId) {
            return res.status(400).json({ message: "Problem ID is required" });
        }

        // Check if already bookmarked
        const existing = await Bookmark.findOne({ userId, problemId });
        if (existing) {
            return res.status(400).json({ message: "Problem already bookmarked" });
        }

        const bookmark = await Bookmark.create({ userId, problemId });
        res.status(201).json({ message: "Bookmark added", bookmark });
    } catch (error) {
        console.error("Add bookmark error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Remove bookmark
const removeBookmark = async (req, res) => {
    try {
        const userId = req.result._id;
        const { problemId } = req.params;

        const result = await Bookmark.findOneAndDelete({ userId, problemId });

        if (!result) {
            return res.status(404).json({ message: "Bookmark not found" });
        }

        res.status(200).json({ message: "Bookmark removed" });
    } catch (error) {
        console.error("Remove bookmark error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all bookmarks for user
const getBookmarks = async (req, res) => {
    try {
        const userId = req.result._id;

        const bookmarks = await Bookmark.find({ userId })
            .populate('problemId', 'title difficulty tags')
            .sort({ createdAt: -1 });

        res.status(200).json(bookmarks);
    } catch (error) {
        console.error("Get bookmarks error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Check if problem is bookmarked
const isBookmarked = async (req, res) => {
    try {
        const userId = req.result._id;
        const { problemId } = req.params;

        const bookmark = await Bookmark.findOne({ userId, problemId });
        res.status(200).json({ isBookmarked: !!bookmark });
    } catch (error) {
        console.error("Check bookmark error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { addBookmark, removeBookmark, getBookmarks, isBookmarked };
