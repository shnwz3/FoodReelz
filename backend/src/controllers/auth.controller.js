const userModel = require("../models/user.model");
const foodPartnerModel = require("../models/foodPartner.model");
const foodModel = require("../models/food.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const likesModel = require("../models/likes.model");
const saveModel = require("../models/save.model");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const alreadyexist = await userModel.findOne({ email });
        if (alreadyexist) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({ name, email, password: hashPassword });
        const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_TOKEN, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true });
        res.status(201).json({ message: "User registered successfully", user: { userId: user._id, name: user.name, email: user.email } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_TOKEN, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true });
        res.status(200).json({ message: "User logged in successfully", user: { userId: user._id, name: user.name, email: user.email } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true });
        res.status(200).json({ message: "User logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const registerFoodPartner = async (req, res) => {
    const { name, email, password, contactNumber, address } = req.body;
    const alreadyexist = await foodPartnerModel.findOne({ email });
    if (alreadyexist) {
        return res.status(400).json({ message: "Food partner already exists" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const foodPartner = await foodPartnerModel.create({ name, email, contactNumber, address, password: hashPassword });
    const token = jwt.sign({ id: foodPartner._id, role: 'partner' }, process.env.JWT_TOKEN, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true });
    res.status(201).json({ message: "Food partner registered successfully", foodPartner: { foodPartnerId: foodPartner._id, name: foodPartner.name, email: foodPartner.email, contactNumber: foodPartner.contactNumber, address: foodPartner.address } });
}

const loginFoodPartner = async (req, res) => {
    try {
        const { email, password } = req.body;
        const foodPartner = await foodPartnerModel.findOne({ email }).select("+password");
        if (!foodPartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, foodPartner.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const token = jwt.sign({ id: foodPartner._id, role: 'partner' }, process.env.JWT_TOKEN, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true });
        res.status(200).json({ message: "Food partner logged in successfully", foodPartner: { foodPartnerId: foodPartner._id, name: foodPartner.name, email: foodPartner.email } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const logoutFoodPartner = async (req, res) => {
    try {
        res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true });
        res.status(200).json({ message: "Food partner logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getFoodPartnerById = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch partner details and their videos in parallel on the server
        const [foodPartner, videos] = await Promise.all([
            foodPartnerModel.findById(id).select("-password"),
            foodModel.find({ foodPartnerId: id }).sort({ createdAt: -1 })
        ]);

        if (!foodPartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }

        // Senior Refinement: Add personalized metadata (isLiked, isSaved)
        let enrichedVideos = videos.map(v => v.toObject());
        const user = req.user;

        if (user) {
            const [userLikes, userSaves] = await Promise.all([
                likesModel.find({ user: user._id, food: { $in: videos.map(v => v._id) } }).select("food"),
                saveModel.find({ user: user._id, food: { $in: videos.map(v => v._id) } }).select("food")
            ]);

            const likedFoodIds = new Set(userLikes.map(l => l.food.toString()));
            const savedFoodIds = new Set(userSaves.map(s => s.food.toString()));

            enrichedVideos = enrichedVideos.map(video => ({
                ...video,
                isLiked: likedFoodIds.has(video._id.toString()),
                isSaved: savedFoodIds.has(video._id.toString())
            }));
        }

        // Return a single consolidated profile object
        res.status(200).json({
            foodPartner,
            videos: enrichedVideos
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { registerUser, loginUser, logoutUser, registerFoodPartner, loginFoodPartner, logoutFoodPartner, getFoodPartnerById };