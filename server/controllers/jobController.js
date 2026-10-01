const Job = require('../models/Job');

const createJob = async (req, res, next) => {
    try {
        const {
            title,
            company,
            location,
            description,
            requirements,
            salary,
            jobType
        } = req.body;

        if (!title || !company || !location || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title, company, location and description are required'
            });
        }

        const job = await Job.create({
            title,
            company,
            location,
            description,
            requirements: requirements || [],
            salary,
            jobType,
            recruiter: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job
        });
    } catch (error) {
        next(error);
    }
};

const getJobs = async (req, res, next) => {
    try {
        const jobs = await Job.find({
            recruiter: req.user._id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        next(error);
    }
};

const getJobById = async (req, res, next) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.json({
            success: true,
            job
        });
    } catch (error) {
        next(error);
    }
};

const updateJob = async (req, res, next) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        const allowedFields = [
            'title',
            'company',
            'location',
            'description',
            'requirements',
            'salary',
            'jobType',
            'status'
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                job[field] = req.body[field];
            }
        });

        await job.save();

        res.json({
            success: true,
            message: 'Job updated successfully',
            job
        });
    } catch (error) {
        next(error);
    }
};

const deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            recruiter: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        await job.deleteOne();

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob
};