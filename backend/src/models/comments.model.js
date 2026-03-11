const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "foodList",
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

// Optimization for fetching comments for a specific reel
commentSchema.index({ food: 1, createdAt: -1 });

const commentsModel = mongoose.model("comments", commentSchema);
module.exports = commentsModel;
