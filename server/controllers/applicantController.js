const Applicant = require("../models/Applicant");
const Job = require("../models/Job");

const createApplicant = async (req, res, next) => {
    try {
        const {
            name,
            email,
            phone,
            resume,
            coverLetter,
            job
        } = req.body;

        if (!name || !email || !job) {
            return res.status(400).json({
                success: false,
                message: "Name, email and job are required"
            });
        }

        const jobExists = await Job.findOne({
            _id: job,
            recruiter: req.user._id
        });

        if (!jobExists) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        const applicant = await Applicant.create({
            name,
            email,
            phone,
            resume,
            coverLetter,
            job,
            recruiter: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Applicant added successfully",
            applicant
        });
    } catch (error) {
        next(error);
    }
};

const getApplicants = async (req, res, next) => {
    try {
        const filter = {
            recruiter: req.user._id
        };

        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.job) {
            filter.job = req.query.job;
        }

        if (req.query.search) {
            filter.$or = [
                {
                    name: {
                        $regex: req.query.search,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: req.query.search,
                        $options: "i"
                    }
                }
            ];
        }

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(
            Math.max(parseInt(req.query.limit) || 6, 1),
            50
        );

        const sortField = req.query.sort || "createdAt";
        const sortOrder = req.query.order === "asc" ? 1 : -1;

        const total = await Applicant.countDocuments(filter);

        const applicants = await Applicant.find(filter)
            .populate("job", "title company")
            .sort({ [sortField]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            success: true,
            count: applicants.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            applicants
        });
    } catch (error) {
        next(error);
    }
};

const getApplicantById = async (req, res, next) => {
    try {
        const applicant = await Applicant.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        }).populate("job", "title company");

        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: "Applicant not found"
            });
        }

        res.json({
            success: true,
            applicant
        });
    } catch (error) {
        next(error);
    }
};

const updateApplicantStatus = async (req, res, next) => {
    try {
        const validStatuses = [
            "Applied",
            "Screening",
            "Interview",
            "Selected",
            "Rejected"
        ];

        if (!validStatuses.includes(req.body.status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid applicant status"
            });
        }

        const applicant = await Applicant.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        });

        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: "Applicant not found"
            });
        }

        applicant.status = req.body.status;

        await applicant.save();

        res.json({
            success: true,
            message: "Applicant status updated successfully",
            applicant
        });
    } catch (error) {
        next(error);
    }
};

const uploadResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "PDF resume is required"
            });
        }

        const applicant = await Applicant.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        });

        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: "Applicant not found"
            });
        }

        applicant.resume = `/uploads/${req.file.filename}`;

        await applicant.save();

        res.json({
            success: true,
            message: "Resume uploaded successfully",
            resume: applicant.resume,
            applicant
        });
    } catch (error) {
        next(error);
    }
};

const deleteApplicant = async (req, res, next) => {
    try {
        const applicant = await Applicant.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        });

        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: "Applicant not found"
            });
        }

        await applicant.deleteOne();

        res.json({
            success: true,
            message: "Applicant deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createApplicant,
    getApplicants,
    getApplicantById,
    updateApplicantStatus,
    uploadResume,
    deleteApplicant
};
