const express = require("express");

const {
    getProfile,
    updateProfile
} = require("../controllers/profileController");

const {
    protect,
    recruiterOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, recruiterOnly);

router.get("/", getProfile);
router.put("/", updateProfile);

module.exports = router;
