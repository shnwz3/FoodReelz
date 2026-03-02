const foodModel = require("../models/food.model");
const { uploadVideo } = require("../services/storage.service");
const crypto = require("crypto");

const createFood = async (req, res) => {
    try {
        const { name, caption } = req.body;
        const file = req.file;

        const videoUrl = await uploadVideo(file.buffer, crypto.randomUUID());
        const food = await foodModel.create({
            name,
            caption,
            video: videoUrl,
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
        const foodItems = await foodModel.find().populate('foodPartnerId', 'name');
        res.status(200).json({ message: "Food items fetched successfully", foodItems });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createFood, getAllFoods };