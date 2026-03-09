const mongoose = require("mongoose");
const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
    },
    video: {
        type: String,
    },
    foodPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "foodPartner",
        // required: true
    },
    likesCount: {
        type: Number,
        default: 0
    },
    savesCount: {
        type: Number,
        default: 0
    },

}, {
    timestamps: true
})

// CRITICAL PRODUCTION INDEXES
// 1. Optimized for Cursor-based pagination (Home Feed)
foodSchema.index({ createdAt: -1, _id: -1 });
// 2. Optimized for fetching Reels by Partner
foodSchema.index({ foodPartnerId: 1 });

const foodModel = mongoose.model("foodList", foodSchema);
module.exports = foodModel;