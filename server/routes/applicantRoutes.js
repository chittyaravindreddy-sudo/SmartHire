const express = require("express");

const {
    createApplicant,
    getApplicants,
    getApplicantById,
    updateApplicantStatus,
    uploadResume,
    deleteApplicant
} = require("../controllers/applicantController");

const {
    protect,
    recruiterOnly
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect, recruiterOnly);

router.post("/", createApplicant);
router.get("/", getApplicants);
router.get("/:id", getApplicantById);
router.put("/:id/status", updateApplicantStatus);
router.post("/:id/resume", upload.single("resume"), uploadResume);
router.delete("/:id", deleteApplicant);

module.exports = router;
