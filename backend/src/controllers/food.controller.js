const foodModel = require("../models/food.model");
const { uploadVideo, deleteVideo } = require("../services/storage.service");
const crypto = require("crypto");
const likesModel = require("../models/likes.model");
const userModel = require("../models/user.model");
const saveModel = require("../models/save.model");

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
        
        // 1. Find the food first to get the File ID
        const food = await foodModel.findById(foodId);
        if (!food) return res.status(404).json({ message: "Food not found" });

        // 2. Perform concurrent cleanup: Cloud Storage + Engagement Data + Database Record
        await Promise.all([
            // Delete video from ImageKit (cloud storage)
            deleteVideo(food.videoFileId).catch(err => {
                console.error(`Failed to delete video ${food.videoFileId} from storage:`, err.message);
                // We continue even if cloud delete fails to ensure DB is cleaned up
            }),
            // Delete associated engagement data
            likesModel.deleteMany({ food: foodId }),
            saveModel.deleteMany({ food: foodId }),
            // Delete the food record itself
            foodModel.findByIdAndDelete(foodId)
        ]);

        res.status(200).json({ message: "Food and associated data deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const likeFood = async (req, res) => {
    try {
        const { food, foodId } = req.body;
        const targetFoodId = food || foodId;
        const user = req.user;

        if (!targetFoodId) {
            return res.status(400).json({ message: "Food ID is required" });
        }

        // 1. Verify food existence (Senior approach: Don't like ghosts)
        const foodItem = await foodModel.findById(targetFoodId);
        if (!foodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }

        const isLiked = await likesModel.findOne({ user: user._id, food: targetFoodId });

        // unlike
        if (isLiked) {
            const [updatedFood] = await Promise.all([
                foodModel.findByIdAndUpdate(targetFoodId, { $inc: { likesCount: -1 } }, { returnDocument: 'after' }),
                likesModel.deleteOne({ _id: isLiked._id })
            ]);
            return res.status(200).json({
                message: "Food unliked successfully",
                likesCount: updatedFood.likesCount,
                isLiked: false
            });
        }

        // like
        const like = await likesModel.create({ user: user._id, food: targetFoodId });
        const updatedFood = await foodModel.findByIdAndUpdate(targetFoodId, { $inc: { likesCount: 1 } }, { returnDocument: 'after' });

        res.status(201).json({
            message: "Food liked successfully",
            likesCount: updatedFood.likesCount,
            isLiked: true,
            like
        });
    }
    catch (error) {
        // Handle unique constraint violation (if race condition occurs despite check)
        if (error.code === 11000) {
            return res.status(400).json({ message: "Already liked" });
        }
        res.status(500).json({ error: error.message });
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
            return res.status(400).json({ message: "Food ID is required" });
        }

        // 1. Verify existence
        const foodItem = await foodModel.findById(targetFoodId);
        if (!foodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }

        const isSaved = await saveModel.findOne({ user: user._id, food: targetFoodId });

        // unsave
        if (isSaved) {
            const [updatedFood] = await Promise.all([
                foodModel.findByIdAndUpdate(targetFoodId, { $inc: { savesCount: -1 } }, { returnDocument: 'after' }),
                saveModel.deleteOne({ _id: isSaved._id })
            ]);
            return res.status(200).json({
                message: "Food unsaved successfully",
                savesCount: updatedFood.savesCount,
                isSaved: false
            });
        }

        // save
        const save = await saveModel.create({ user: user._id, food: targetFoodId });
        const updatedFood = await foodModel.findByIdAndUpdate(targetFoodId, { $inc: { savesCount: 1 } }, { returnDocument: 'after' });

        res.status(201).json({
            message: "Food saved successfully",
            savesCount: updatedFood.savesCount,
            isSaved: true,
            save
        });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Already saved" });
        }
        res.status(500).json({ error: error.message });
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
