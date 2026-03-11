const foodModel = require("../models/food.model");
const { uploadVideo, deleteVideo } = require("../services/storage.service");
const crypto = require("crypto");
const likesModel = require("../models/likes.model");
const userModel = require("../models/user.model");
const saveModel = require("../models/save.model");
const commentsModel = require("../models/comments.model");

const createFood = async (req, res) => {
    try {
        const { name, caption } = req.body;
        const file = req.file;

        const { url, fileId } = await uploadVideo(file.buffer, crypto.randomUUID());
        const food = await foodModel.create({
            name,
            caption,
            video: url,
            videoFileId: fileId,
            foodPartnerId: req.foodpartner._id
        });
        res.status(201).json({ message: "Food added successfully", food });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAllFoods = async (req, res) => {
    try {
        const user = req.user; // User might be undefined if not logged in
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [foodItems, total] = await Promise.all([
            foodModel.find()
                .populate('foodPartnerId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            foodModel.countDocuments()
        ]);

        // Senior Refinement: Add personalized metadata (isLiked, isSaved)
        let enrichedFoods = foodItems.map(item => item.toObject());

        if (user) {
            const [userLikes, userSaves] = await Promise.all([
                likesModel.find({ user: user._id, food: { $in: foodItems.map(f => f._id) } }).select('food'),
                saveModel.find({ user: user._id, food: { $in: foodItems.map(f => f._id) } }).select('food')
            ]);

            const likedFoodIds = new Set(userLikes.map(l => l.food.toString()));
            const savedFoodIds = new Set(userSaves.map(s => s.food.toString()));

            enrichedFoods = enrichedFoods.map(food => ({
                ...food,
                isLiked: likedFoodIds.has(food._id.toString()),
                isSaved: savedFoodIds.has(food._id.toString())
            }));
        }

        res.status(200).json({
            message: "Food items fetched successfully",
            foodItems: enrichedFoods,
            pagination: {
                total,
                page,
                limit,
                hasMore: skip + foodItems.length < total
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getFoodsByPartnerId = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const user = req.user;
        const foodItems = await foodModel.find({ foodPartnerId: partnerId }).sort({ createdAt: -1 });

        let enrichedFoods = foodItems.map(item => item.toObject());

        if (user) {
            const [userLikes, userSaves] = await Promise.all([
                likesModel.find({ user: user._id, food: { $in: foodItems.map(f => f._id) } }).select('food'),
                saveModel.find({ user: user._id, food: { $in: foodItems.map(f => f._id) } }).select('food')
            ]);

            const likedFoodIds = new Set(userLikes.map(l => l.food.toString()));
            const savedFoodIds = new Set(userSaves.map(s => s.food.toString()));

            enrichedFoods = enrichedFoods.map(food => ({
                ...food,
                isLiked: likedFoodIds.has(food._id.toString()),
                isSaved: savedFoodIds.has(food._id.toString())
            }));
        }

        res.status(200).json({ foodItems: enrichedFoods });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteFood = async (req, res) => {
    try {
        const { foodId } = req.params;
        
        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ 
                success: false,
                message: "Target food reel not found" 
            });
        }

        await Promise.all([
            deleteVideo(food.videoFileId).catch(err => {
                console.error(`[Cleanup Trace] Storage deletion failed for ID ${food.videoFileId}:`, err.message);
            }),
            
            likesModel.deleteMany({ food: foodId }),
            saveModel.deleteMany({ food: foodId }),
            commentsModel.deleteMany({ food: foodId }),
            
            foodModel.findByIdAndDelete(foodId)
        ]);

        return res.status(200).json({ 
            success: true,
            message: "Reel and all associated engagement data purged successfully" 
        });
    }
    catch (error) {
        console.error(`[Critical Error] deleteFood failed for ID ${req.params.foodId}:`, error);
        res.status(500).json({ success: false, error: "Internal server error during reel deletion" });
    }
}

const likeFood = async (req, res) => {
    try {
        const { food, foodId } = req.body;
        const targetFoodId = food || foodId;
        const user = req.user;

        if (!targetFoodId) {
            return res.status(400).json({ success: false, message: "Food ID is required" });
        }

        const foodItem = await foodModel.findById(targetFoodId);
        if (!foodItem) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        const existingLike = await likesModel.findOne({ user: user._id, food: targetFoodId });

        if (existingLike) {
            // Un-liking operation: Atomic decrement + deletion
            const [updatedFood] = await Promise.all([
                foodModel.findByIdAndUpdate(targetFoodId, { $inc: { likesCount: -1 } }, { returnDocument: 'after' }),
                likesModel.deleteOne({ _id: existingLike._id })
            ]);

            return res.status(200).json({
                success: true,
                message: "Like removed",
                likesCount: updatedFood.likesCount,
                isLiked: false
            });
        }

        // Liking operation: Atomic increment + creation
        const [like, updatedFood] = await Promise.all([
            likesModel.create({ user: user._id, food: targetFoodId }),
            foodModel.findByIdAndUpdate(targetFoodId, { $inc: { likesCount: 1 } }, { returnDocument: 'after' })
        ]);

        return res.status(201).json({
            success: true,
            message: "Liked successfully",
            likesCount: updatedFood.likesCount,
            isLiked: true,
            like
        });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Already liked" });
        }
        res.status(500).json({ success: false, error: error.message });
    }
}

const getLikedFoods = async (req, res) => {
    try {
        const user = req.user;
        const likedFoods = await likesModel.find({ user: user._id }).populate('food');
        res.status(200).json({ likedFoods });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const saveFood = async (req, res) => {
    try {
        const { food, foodId } = req.body;
        const targetFoodId = food || foodId;
        const user = req.user;

        if (!targetFoodId) {
            return res.status(400).json({ success: false, message: "Food ID is required" });
        }

        const foodItem = await foodModel.findById(targetFoodId);
        if (!foodItem) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        const existingSave = await saveModel.findOne({ user: user._id, food: targetFoodId });

        if (existingSave) {
            // Un-saving: Atomic decrement + deletion
            const [updatedFood] = await Promise.all([
                foodModel.findByIdAndUpdate(targetFoodId, { $inc: { savesCount: -1 } }, { returnDocument: 'after' }),
                saveModel.deleteOne({ _id: existingSave._id })
            ]);

            return res.status(200).json({
                success: true,
                message: "Removed from saves",
                savesCount: updatedFood.savesCount,
                isSaved: false
            });
        }

        // Saving: Atomic increment + creation
        const [save, updatedFood] = await Promise.all([
            saveModel.create({ user: user._id, food: targetFoodId }),
            foodModel.findByIdAndUpdate(targetFoodId, { $inc: { savesCount: 1 } }, { returnDocument: 'after' })
        ]);

        res.status(201).json({
            success: true,
            message: "Saved successfully",
            savesCount: updatedFood.savesCount,
            isSaved: true,
            save
        });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Already saved" });
        }
        res.status(500).json({ success: false, error: error.message });
    }
}

const getLikedUsersByFood = async (req, res) => {
    try {
        const { foodId } = req.params;
        const likes = await likesModel.find({ food: foodId }).populate('user', 'name email');
        const users = likes.map(l => l.user).filter(u => u !== null);
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getSavedUsersByFood = async (req, res) => {
    try {
        const { foodId } = req.params;
        const saves = await saveModel.find({ food: foodId }).populate('user', 'name email');
        const users = saves.map(s => s.user).filter(u => u !== null);
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { createFood, getAllFoods, getFoodsByPartnerId, likeFood, saveFood, getLikedFoods, getLikedUsersByFood, getSavedUsersByFood, deleteFood };
