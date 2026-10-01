const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Applicant name is required'],
            trim: true
        },

        email: {
            type: String,
            required: [true, 'Applicant email is required'],
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            trim: true
        },

        resume: {
            type: String,
            trim: true
        },

        coverLetter: {
            type: String,
            trim: true
        },

        status: {
            type: String,
            enum: [
                'Applied',
                'Screening',
                'Interview',
                'Selected',
                'Rejected'
            ],
            default: 'Applied'
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true
        },

        recruiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Applicant', applicantSchema);