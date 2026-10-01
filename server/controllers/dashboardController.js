const Job = require('../models/Job');
const Applicant = require('../models/Applicant');

const getDashboardStats = async (req, res, next) => {
    try {
        const recruiter = req.user._id;

        const [
            totalJobs,
            openJobs,
            totalApplicants,
            selectedApplicants,
            rejectedApplicants,
            interviewApplicants,
            screeningApplicants
        ] = await Promise.all([
            Job.countDocuments({ recruiter }),
            Job.countDocuments({ recruiter, status: 'Open' }),
            Applicant.countDocuments({ recruiter }),
            Applicant.countDocuments({ recruiter, status: 'Selected' }),
            Applicant.countDocuments({ recruiter, status: 'Rejected' }),
            Applicant.countDocuments({ recruiter, status: 'Interview' }),
            Applicant.countDocuments({ recruiter, status: 'Screening' })
        ]);

        res.json({
            success: true,
            stats: {
                totalJobs,
                openJobs,
                totalApplicants,
                selectedApplicants,
                rejectedApplicants,
                interviewApplicants,
                screeningApplicants
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats };