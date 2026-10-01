const express = require("express");

const {
    protect,
    recruiterOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, recruiterOnly, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

module.exports = router;
