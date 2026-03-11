const commentsModel = require("../models/comments.model");
const foodModel = require("../models/food.model");
const userModel = require("../models/user.model"); // Ensure User model is registered for population

const addComment = async (req, res) => {
    try {
        const { foodId } = req.params;
        const { text } = req.body;
        const user = req.user;

        if (!text?.trim()) {
            return res.status(400).json({ success: false, message: "Comment text cannot be empty" });
        }

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ success: false, message: "Target reel not found" });
        }

        const [comment] = await Promise.all([
            commentsModel.create({ user: user._id, food: foodId, text: text.trim() }),
            foodModel.findByIdAndUpdate(foodId, { $inc: { commentsCount: 1 } })
        ]);

        await comment.populate("user", "name email");

        res.status(201).json({ 
            success: true,
            message: "Comment posted", 
            comment 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getCommentsByFoodId = async (req, res) => {
    try {
        const { foodId } = req.params;
        const comments = await commentsModel.find({ food: foodId })
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({ 
            success: true,
            count: comments.length,
            comments 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const requester = req.user;

        // Senior Refinement: Use selective populate to fetch ONLY the foodPartnerId
        const comment = await commentsModel.findById(commentId).populate({
            path: 'food',
            select: 'foodPartnerId'
        });

        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        // Defensive check: If the reel was deleted, the comment is an orphan
        if (!comment.food) {
            await commentsModel.findByIdAndDelete(commentId);
            return res.status(200).json({ success: true, message: "Orphan comment removed" });
        }

        const isAuthor = comment.user.toString() === requester._id.toString();
        const isVideoOwner = requester.role === 'partner' && comment.food.foodPartnerId.toString() === requester._id.toString();

        if (!isAuthor && !isVideoOwner) {
            return res.status(403).json({ success: false, message: "Forbidden: You don't have permission to delete this comment" });
        }

        await Promise.all([
            commentsModel.findByIdAndDelete(commentId),
            foodModel.findByIdAndUpdate(comment.food._id, { $inc: { commentsCount: -1 } })
        ]);

        res.status(200).json({ success: true, message: "Comment removed" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { addComment, getCommentsByFoodId, deleteComment };
