const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createFood, getAllFoods, getFoodsByPartnerId, likeFood, saveFood, getLikedFoods, getLikedUsersByFood, getSavedUsersByFood, deleteFood } = require("../controllers/food.controller");
const { addComment, getCommentsByFoodId, deleteComment } = require("../controllers/comment.controller");
const { authFoodPartnerMiddleware, authUserMiddleware, optionalAuth, anyAuth } = require("../middlewares/auth.middleware");

const upload = multer({ storage: multer.memoryStorage() });

/*
    POST /api/food/  [protected route => foodpartner]
*/
router.post("/", authFoodPartnerMiddleware, upload.single("video"), createFood);

/* 
    GET /api/food/  [public but personalized]
*/
router.get("/", optionalAuth, getAllFoods);

/*
    GET /api/food/partner/:partnerId [public but personalized]
*/
router.get("/partner/:partnerId", optionalAuth, getFoodsByPartnerId);

/*
    DELETE /api/food/:foodId [protected route => foodpartner]
*/
router.delete("/:foodId", authFoodPartnerMiddleware, deleteFood);

/*
    POST /api/food/like [protected route => user]
*/
router.post("/like", authUserMiddleware, likeFood);

/*
    POST /api/food/save [protected route => user]
*/
router.post("/save", authUserMiddleware, saveFood);


router.get("/liked", authUserMiddleware, getLikedFoods);

// Engagement routes
router.get("/:foodId/likes", getLikedUsersByFood);
router.get("/:foodId/saves", getSavedUsersByFood);

// Comment routes
router.post("/:foodId/comments", authUserMiddleware, addComment);
router.get("/:foodId/comments", getCommentsByFoodId);
router.delete("/comments/:commentId", anyAuth, deleteComment);

module.exports = router;