const foodPartnerModel = require("../models/foodPartner.model");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const getToken = (req) => {
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        return req.headers.authorization.split(" ")[1];
    }
    return null;
};

const authFoodPartnerMiddleware = async (req, res, next) => {
    const token = getToken(req);
    if (!token) {
        return res.status(401).json({ message: "Please login first" });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);

        if (decodedToken.role !== 'partner') {
            return res.status(403).json({ message: "Access denied. Partners only." });
        }

        const foodpartner = await foodPartnerModel.findById(decodedToken.id);
        if (!foodpartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }
        req.foodpartner = foodpartner;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
}

const authUserMiddleware = async (req, res, next) => {
    const token = getToken(req);
    if (!token) {
        return res.status(401).json({ message: "Please login first" });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);

        if (decodedToken.role !== 'user') {
            return res.status(403).json({ message: "Access denied. Users only." });
        }

        const user = await userModel.findById(decodedToken.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
}

const optionalAuth = async (req, res, next) => {
    const token = getToken(req);
    if (!token) {
        return next();
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);

        if (decodedToken.role === 'partner') {
            req.user = await foodPartnerModel.findById(decodedToken.id);
        } else {
            req.user = await userModel.findById(decodedToken.id);
        }
        next();
    }
    catch (error) {
        next();
    }
}

module.exports = { authFoodPartnerMiddleware, authUserMiddleware, optionalAuth };