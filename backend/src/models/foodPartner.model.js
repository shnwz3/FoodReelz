const mongoose = require("mongoose");

const foodPartnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },

}, {
    timestamps: true
});
const foodPartnerModel = mongoose.model("foodPartner", foodPartnerSchema);
module.exports = foodPartnerModel;
